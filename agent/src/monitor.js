require("dotenv").config();
const { runXCMIfTriggered } = require("./xcm-runner");

const EXECUTE = process.env.XCM_EXECUTE === "true" || process.env.XCM_EXECUTE === "1";

async function poll(intervalMs = 10000) {
  const r = await runXCMIfTriggered({ execute: EXECUTE });
  console.log(new Date().toISOString(), r);
  setTimeout(() => poll(intervalMs), intervalMs);
}

poll().catch(console.error);