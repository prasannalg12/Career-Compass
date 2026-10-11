// Decides how the roadmap should change after a skill assessment.
// score is 0-1. Every decision carries a plain-language reason shown to the user.
function decideAdaptation({ score, currentLevel, requiredLevel }) {
  const pct = Math.round(score * 100);
  if (score >= 0.8) {
    const newLevel = Math.min(5, currentLevel + 1);
    return { action: "advance", newLevel,
      reason: "You scored " + pct + "%, so your level is now " + newLevel + ". Material you already know has been skipped." +
        (newLevel >= requiredLevel ? " This skill has reached the level your career needs." : "") };
  }
  if (score >= 0.5) {
    return { action: "hold", newLevel: currentLevel,
      reason: "You scored " + pct + "%. Your level stays at " + currentLevel + ", and we added a practice task to firm up the basics." };
  }
  return { action: "remediate", newLevel: currentLevel,
    reason: "You scored " + pct + "%. We added an easier review resource before you retry the skill check." };
}

module.exports = { decideAdaptation };
