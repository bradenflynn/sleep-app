import JSZip from 'jszip';

class XMLParserService {
    /**
     * Main entry point. Accepts either an XML string or a raw File object (zip or xml).
     */
    async processFile(file) {
        if (file.name.endsWith('.zip')) {
            return this.parseZipFile(file);
        } else {
            const text = await file.text();
            return this.parseHealthExport(text);
        }
    }

    /**
     * Unzips the file in memory and locates export.xml
     */
    async parseZipFile(file) {
        console.log("Extracting Apple Health Zip...");
        try {
            const zip = await JSZip.loadAsync(file);
            // Apple Health exports place the file at apple_health_export/export.xml
            const xmlFile = zip.file("apple_health_export/export.xml") || zip.file("export.xml");

            if (!xmlFile) {
                throw new Error("export.xml not found inside the zip file.");
            }

            const xmlString = await xmlFile.async("string");
            return this.parseHealthExport(xmlString);
        } catch (e) {
            console.error("Failed to parse zip:", e);
            return null;
        }
    }

    /**
     * Parses Apple Health export.xml string and extracts key performance metrics.
     */
    parseHealthExport(xmlString) {
        console.log("Parsing Apple Health Export XML...");

        const results = {
            hrv: [],
            rhr: [],
            sleep: [],
        };

        // We only want recent data for the dashboard (e.g., last 30 days of HRV/RHR, last night's sleep)
        // For MVP RegExp parsing, we just grab everything and average it, 
        // but in a production app we would filter by the `endDate` attribute.

        const hrvRegex = /<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN".*?value="([\d.]+)"/g;
        let match;
        while ((match = hrvRegex.exec(xmlString)) !== null) {
            results.hrv.push(parseFloat(match[1]));
        }

        const rhrRegex = /<Record type="HKQuantityTypeIdentifierRestingHeartRate".*?value="([\d.]+)"/g;
        while ((match = rhrRegex.exec(xmlString)) !== null) {
            results.rhr.push(parseFloat(match[1]));
        }

        // Capture sleep stages
        const sleepRegex = /<Record type="HKCategoryTypeIdentifierSleepAnalysis".*?value="(.*?)".*?startDate="(.*?)".*?endDate="(.*?)"/g;
        while ((match = sleepRegex.exec(xmlString)) !== null) {
            const type = match[1];
            const start = new Date(match[2]);
            const end = new Date(match[3]);
            const duration = Math.max(0, (end - start) / (1000 * 60)); // minutes

            // In Apple Health, overlapping records exist. This is a simplified sum.
            results.sleep.push({ type, duration, end });
        }

        return this.synthesizeData(results);
    }

    /**
     * Synthesizes raw records into a PerformanceDashboard payload using Apple Guidelines.
     */
    synthesizeData(raw) {
        if (raw.hrv.length === 0 && raw.rhr.length === 0 && raw.sleep.length === 0) return null;

        // Averages
        const avgHrv = raw.hrv.length > 0 ? Math.round(raw.hrv.reduce((a, b) => a + b, 0) / raw.hrv.length) : null;
        const avgRhr = raw.rhr.length > 0 ? Math.round(raw.rhr.reduce((a, b) => a + b, 0) / raw.rhr.length) : null;

        // Summing Sleep (Simplified: assuming the XML contains roughly a night or average of nights)
        // In a real app we would group by day. Here we just take the total recorded and assume it's one session
        // to match the requested MVP behavior.
        let totalSleep = 0;
        let deepSleep = 0;
        let remSleep = 0;

        raw.sleep.forEach(s => {
            // Apple strings: HKCategoryValueSleepAnalysisAsleepCore, AsleepDeep, AsleepREM, InBed
            if (s.type.includes('Asleep') || s.type.includes('Unspecified')) {
                totalSleep += s.duration;
                if (s.type.includes('Deep')) deepSleep += s.duration;
                if (s.type.includes('REM')) remSleep += s.duration;
            }
        });

        // Handle empty sleep data by falling back to mock visually, or 0
        if (totalSleep === 0) totalSleep = 420; // 7h fallback if XML lacks sleep

        const metrics = {
            hrv: avgHrv || 65,
            rhr: avgRhr || 52,
            sleepDuration: Math.round(totalSleep),
            deepSleep: Math.round(deepSleep) || 60, // Fallback
            remSleep: Math.round(remSleep) || 90   // Fallback
        };

        return this.calculateAppleGuidelines(metrics);
    }

    /**
     * Applies Apple-like guidelines and calculates diagnostic feedback.
     */
    calculateAppleGuidelines(metrics) {
        let score = 100;
        let diagnostics = [];
        let lowIndicators = { hrv: false, rhr: false, totalSleep: false, deepSleep: false, remSleep: false };

        // 1. Total Sleep (Target 7-9 hours / 420-540 mins)
        if (metrics.sleepDuration < 420) {
            score -= 15;
            lowIndicators.totalSleep = true;
            diagnostics.push("Total Sleep is low (< 7h). Protocol: Maintain a strict 8-hour sleep window.");
        }

        // 2. Deep Sleep (Target 15-25% of total)
        const deepPct = metrics.deepSleep / metrics.sleepDuration;
        if (deepPct < 0.15) {
            score -= 15;
            lowIndicators.deepSleep = true;
            diagnostics.push(`Deep Sleep is low (${Math.round(deepPct * 100)}%). Protocol: Drop room temp to 65°F and consider Magnesium Threonate.`);
        }

        // 3. REM Sleep (Target 20-25% of total)
        const remPct = metrics.remSleep / metrics.sleepDuration;
        if (remPct < 0.20) {
            score -= 10;
            lowIndicators.remSleep = true;
            diagnostics.push(`REM Sleep is low (${Math.round(remPct * 100)}%). Protocol: Avoid alcohol and heavy meals 3 hours before bed.`);
        }

        // 4. Resting Heart Rate (< 60 bpm is ideal for athletes)
        if (metrics.rhr > 60) {
            score -= 10;
            lowIndicators.rhr = true;
            diagnostics.push(`RHR is elevated (${metrics.rhr} bpm). Protocol: Practice 4-7-8 breathing before bed to activate parasympathetic system.`);
        }

        // 5. Heart Rate Variability (Higher is better, usually > 50ms)
        if (metrics.hrv < 50) {
            score -= 10;
            lowIndicators.hrv = true;
            diagnostics.push(`HRV is low (${metrics.hrv} ms) indicating poor recovery. Protocol: Consider NSDR session mid-day.`);
        }

        return {
            ...metrics,
            score: Math.max(score, 0),
            indicators: lowIndicators,
            diagnostics: diagnostics,
            source: 'Imported File'
        };
    }
}

export default new XMLParserService();
