
function computeGaps(requirements, userLevels) {
  return requirements
    .map((requirement) => {
      const current =
        Number(userLevels.get(requirement.skillId)) || 0;

      const required =
        Number(requirement.required) || 1;

      const importance =
        Number(requirement.importance) || 1;

      const gap = Math.max(0, required - current);

      // Normalized priority matches roadmapEngine.js
      const priority =
        importance * (gap / Math.max(1, required));

      return {
        skillId: requirement.skillId,
        name: requirement.name,
        required,
        current,
        gap,
        importance,
        priority
      };
    })
    .filter((skill) => skill.gap > 0)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        b.importance - a.importance
    );
}

module.exports = { computeGaps };
