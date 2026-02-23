// Quick prototype of calculation to make UI easier
let sleepDuration = 450;
let deepSleep = 110;
let remSleep = 95;

let deepPct = (deepSleep / sleepDuration) * 100;
let remPct = (remSleep / sleepDuration) * 100;
let lightPct = 100 - deepPct - remPct;

console.log(`deep: ${deepPct}%, rem: ${remPct}%, light: ${lightPct}%`);
