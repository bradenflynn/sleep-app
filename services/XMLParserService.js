class XMLParserService {
    /**
     * Parses Apple Health export.xml string and extracts key performance metrics.
     * @param {string} xmlString 
     */
    parseHealthExport(xmlString) {
        console.log("Parsing Apple Health Export XML...");

        const results = {
            hrv: [],
            rhr: [],
            sleep: [],
        };

        // Extract HRV (HeartRateVariabilitySDNN)
        const hrvRegex = /<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN".*?value="([\d.]+)"/g;
        let match;
        while ((match = hrvRegex.exec(xmlString)) !== null) {
            results.hrv.push(parseFloat(match[1]));
        }

        // Extract RHR (RestingHeartRate)
        const rhrRegex = /<Record type="HKQuantityTypeIdentifierRestingHeartRate".*?value="([\d.]+)"/g;
        while ((match = rhrRegex.exec(xmlString)) !== null) {
            results.rhr.push(parseFloat(match[1]));
        }

        // Extract Sleep (HKCategoryTypeIdentifierSleepAnalysis)
        // Values: HKCategoryValueSleepAnalysisAsleepUnspecified, HKCategoryValueSleepAnalysisAsleepDeep, etc.
        const sleepRegex = /<Record type="HKCategoryTypeIdentifierSleepAnalysis".*?value="(.*?)".*?startDate="(.*?)".*?endDate="(.*?)"/g;
        while ((match = sleepRegex.exec(xmlString)) !== null) {
            const type = match[1];
            const start = new Date(match[2]);
            const end = new Date(match[3]);
            const duration = (end - start) / (1000 * 60); // minutes

            results.sleep.push({ type, duration });
        }

        return this.synthesizeData(results);
    }

    /**
     * Averages/Synthesizes the raw records into a PerformanceDashboard payload.
     */
    synthesizeData(raw) {
        if (raw.hrv.length === 0 && raw.rhr.length === 0) return null;

        const avgHrv = raw.hrv.length > 0 ? Math.round(raw.hrv.reduce((a, b) => a + b, 0) / raw.hrv.length) : 65;
        const avgRhr = raw.rhr.length > 0 ? Math.round(raw.rhr.reduce((a, b) => a + b, 0) / raw.rhr.length) : 52;

        let totalSleep = 0;
        let deepSleep = 0;
        let remSleep = 0;

        raw.sleep.forEach(s => {
            totalSleep += s.duration;
            if (s.type.includes('Deep')) deepSleep += s.duration;
            if (s.type.includes('REM')) remSleep += s.duration;
        });

        // Simple performance score calculation (for demo purposes)
        // high HRV and low RHR = high score
        const hrvFactor = Math.min(avgHrv / 80, 1.2);
        const rhrFactor = Math.max(1 - (avgRhr - 45) / 50, 0.5);
        const score = Math.round((hrvFactor * 50) + (rhrFactor * 50));

        return {
            score: Math.min(score, 100),
            hrv: avgHrv,
            rhr: avgRhr,
            sleepDuration: Math.round(totalSleep || 450),
            deepSleep: Math.round(deepSleep || 110),
            remSleep: Math.round(remSleep || 95),
            source: 'Imported File'
        };
    }
}

export default new XMLParserService();
