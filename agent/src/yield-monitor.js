const { fetchAPYs } = require("./oracle");

const APY_DIFF_THRESHOLD = 2; // 2%

async function shouldTriggerXCM() {
  const yields = await fetchAPYs();
  yields.sort((a, b) => b.apy - a.apy);
  const best = yields[0];
  const second = yields[1];
  const diff = best.apy - (second?.apy ?? 0);
  return {
    trigger: diff >= APY_DIFF_THRESHOLD,
    best,
    diff,
    destination: best,
  };
}

module.exports = { shouldTriggerXCM };