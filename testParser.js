const JSZip = require('jszip');
const fs = require('fs');

// We copy the parseHealthExport logic to test it
function parseHealthExport(xmlString) {
    const results = {
        hrv: [],
        rhr: [],
        sleep: [],
    };

    const hrvRegex = /<Record type="HKQuantityTypeIdentifierHeartRateVariabilitySDNN".*?value="([\d.]+)"/g;
    let match;
    while ((match = hrvRegex.exec(xmlString)) !== null) {
        results.hrv.push(parseFloat(match[1]));
    }

    const rhrRegex = /<Record type="HKQuantityTypeIdentifierRestingHeartRate".*?value="([\d.]+)"/g;
    while ((match = rhrRegex.exec(xmlString)) !== null) {
        results.rhr.push(parseFloat(match[1]));
    }

    const sleepRegex = /<Record type="HKCategoryTypeIdentifierSleepAnalysis".*?value="(.*?)".*?startDate="(.*?)".*?endDate="(.*?)"/g;
    while ((match = sleepRegex.exec(xmlString)) !== null) {
        const type = match[1];
        const start = new Date(match[2]);
        const end = new Date(match[3]);
        const duration = Math.max(0, (end - start) / (1000 * 60)); // minutes
        results.sleep.push({ type, duration, end });
    }

    let totalSleep = 0; let deepSleep = 0; let remSleep = 0;
    results.sleep.forEach(s => {
        if (s.type.includes('Asleep') || s.type.includes('Unspecified')) {
            totalSleep += s.duration;
            if (s.type.includes('Deep')) deepSleep += s.duration;
            if (s.type.includes('REM')) remSleep += s.duration;
        }
    });

    return {
        hrvCount: results.hrv.length,
        rhrCount: results.rhr.length,
        sleepCount: results.sleep.length,
        totalSleep, deepSleep, remSleep
    };
}

(async () => {
    console.log("Loading zip...");
    const data = fs.readFileSync('health data.zip');
    const zip = await JSZip.loadAsync(data);
    const xmlFile = zip.file("apple_health_export/export.xml") || zip.file("export.xml");
    console.log("Unzipping string...");
    const xmlString = await xmlFile.async("string");
    console.log("Parsing XML...");
    const res = parseHealthExport(xmlString);
    console.log(res);
})();
