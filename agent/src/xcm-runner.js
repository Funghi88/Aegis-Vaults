const { spawn } = require("child_process");
const path = require("path");
const { shouldTriggerXCM } = require("./yield-monitor");

const XCM_SCRIPTS_DIR = path.join(__dirname, "../../packages/xcm-scripts");
const XCM_SCRIPT = path.join(XCM_SCRIPTS_DIR, "xcm-usdc-transfer.js");

async function executeXCM(destParaId, amount, recipientSs58) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [XCM_SCRIPT], {
      cwd: XCM_SCRIPTS_DIR,
      env: {
        ...process.env,
        DEST_PARA_ID: String(destParaId),
        AMOUNT: String(amount),
        RECIPIENT_SS58: recipientSs58,
      },
      stdio: "inherit",
    });
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`XCM script exited with code ${code}`))
    );
    child.on("error", reject);
  });
}

async function runXCMIfTriggered(opts = {}) {
  const { execute = false } = opts;
  const result = await shouldTriggerXCM();

  if (!result.trigger) {
    return { action: "skip", reason: `APY diff ${result.diff.toFixed(2)}% < 2%` };
  }

  const payload = {
    action: "trigger",
    destination: result.best,
    destParaId: result.best.paraId,
    diff: result.diff,
  };

  if (execute) {
    const recipientSs58 = process.env.RECIPIENT_SS58 || process.env.XCM_RECIPIENT_SS58;
    const amount = process.env.XCM_AMOUNT || "100000000"; // 0.01 PAS (10 dec) default

    if (!recipientSs58) {
      return { ...payload, executed: false, error: "Set RECIPIENT_SS58 or XCM_RECIPIENT_SS58 to execute" };
    }

    try {
      await executeXCM(result.best.paraId, amount, recipientSs58);
      return { ...payload, executed: true };
    } catch (err) {
      return { ...payload, executed: false, error: err.message };
    }
  }

  return payload;
}

module.exports = { runXCMIfTriggered, executeXCM };