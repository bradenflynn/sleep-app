const JSZip = require('jszip');
const fs = require('fs');

function parseHealthExport(xmlString) {
    const results = {
        hrv: [],
        rhr: [],
        sleep: [],
    };

    const hrvRegex = /<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN"[^>]*?startDate="(.*?)"[^>]*?value="([\d.]+)"/g;
    let match;
    while ((match = hrvRegex.exec(xmlString)) !== null) {
        results.hrv.push({ date: new Date(match[1]), value: parseFloat(match[2]) });
    }

    const rhrRegex = /<Record type="HKQuantityTypeIdentifierRestingHeartRate"[^>]*?startDate="(.*?)"[^>]*?value="([\d.]+)"/g;
    while ((match = rhrRegex.exec(xmlString)) !== null) {
        results.rhr.push({ date: new Date(match[1]), value: parseFloat(match[2]) });
    }

    const sleepRegex = /<Record type="HKCategoryTypeIdentifierSleepAnalysis"[^>]*?value="(.*?)"[^>]*?startDate="(.*?)"[^>]*?endDate="(.*?)"/g;
    while ((match = sleepRegex.exec(xmlString)) !== null) {
        const type = match[1];
        const start = new Date(match[2]);
        const end = new Date(match[3]);
        const duration = Math.max(0, (end - start) / (1000 * 60)); // minutes

        results.sleep.push({ type, duration, end });
    }

    // Find the latest date
    let maxDate = 0;
    results.sleep.forEach(s => { if (s.end > maxDate) maxDate = s.end; });
    
    // Fallback to HR data if no sleep data
    if (maxDate === 0) {
        results.rhr.forEach(r => { if (r.date > maxDate) maxDate = r.date; });
        results.hrv.forEach(h => { if (h.date > maxDate) maxDate = h.date; });
    }

    if (maxDate !== 0) {
        // filter for last 24h of the max date
        const dayinMs = 24 * 60 * 60 * 1000;
        results.sleep = results.sleep.filter(s => (maxDate - s.end) <= dayinMs * 2); 
        results.rhr = results.rhr.filter(r => (maxDate - r.date) <= dayinMs * 7); // maybe a week for avg HR?
        results.hrv = results.hrv.filter(h => (maxDate - h.date) <= dayinMs * 7);
    }
    
    console.log("Filtered counts:", results.hrv.length, results.rhr.length, results.sleep.length);
}

(async () => {
    const data = fs.readFileSync('health data.zip');
    const zip = await JSZip.loadAsync(data);
    const xmlFile = zip.file("apple_health_export/export.xml") || zip.file("export.xml");
    const xmlString = await xmlFile.async("string");
    parseHealthExport(xmlString);
})();
