
/**
 * CareerCompass - Career Matching Engine v2
 *
 * Features:
 * 1. Weighted skill compatibility
 * 2. Interest-based matching
 * 3. Individual skill-gap analysis
 * 4. Priority learning recommendations
 * 5. Explainable recommendation scores
 *
 * Compatible with existing /careers/recommendations API.
 */

function normalizeLevel(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(5, number));
}

function normalizeImportance(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, number);
}

/**
 * Analyze each required skill.
 *
 * Returns the user's current level, required level,
 * skill gap, readiness, and learning priority.
 */
function analyzeSkillGaps(requirements, userLevels) {
  return requirements.map((requirement) => {
    const currentLevel = normalizeLevel(
      userLevels.get(requirement.skillId)
    );

    const requiredLevel = normalizeLevel(
      requirement.required
    );

    const importance = normalizeImportance(
      requirement.importance
    );

    const gap = Math.max(
      0,
      requiredLevel - currentLevel
    );

    const readiness = requiredLevel > 0
      ? Math.min(currentLevel / requiredLevel, 1)
      : 1;

    const priority = requiredLevel > 0
      ? importance * (gap / requiredLevel)
      : 0;

    return {
      skillId: requirement.skillId,
      currentLevel,
      requiredLevel,
      importance,
      gap,
      readiness: Math.round(readiness * 100),
      priority: Number(priority.toFixed(3)),
      status: gap === 0
        ? "ready"
        : "needs_improvement"
    };
  });
}

/**
 * Calculate weighted skill fit.
 *
 * Returns a value from 0 to 1.
 *
 * This preserves the original weighted
 * skill-fit calculation without rounding
 * intermediate readiness values.
 */
function skillFit(requirements, userLevels) {
  const totalWeight = requirements.reduce(
    (sum, requirement) => {
      return sum + normalizeImportance(
        requirement.importance
      );
    },
    0
  );

  if (totalWeight === 0) {
    return 0;
  }

  const earnedWeight = requirements.reduce(
    (sum, requirement) => {
      const currentLevel = normalizeLevel(
        userLevels.get(requirement.skillId)
      );

      const requiredLevel = normalizeLevel(
        requirement.required
      );

      const importance = normalizeImportance(
        requirement.importance
      );

      const readiness = requiredLevel > 0
        ? Math.min(currentLevel / requiredLevel, 1)
        : 1;

      return sum + importance * readiness;
    },
    0
  );

  return earnedWeight / totalWeight;
}

/**
 * Rank careers based on:
 *
 * 70% - Weighted skill compatibility
 * 30% - Interest alignment
 *
 * Keeps the existing frontend response fields
 * and adds explainability data.
 */
function rankCareers(
  { interests = [] },
  userLevels,
  careers
) {
  return careers
    .map((career) => {
      const requirements = career.requirements || [];

      // 1. Analyze individual skill gaps
      const skillGaps = analyzeSkillGaps(
        requirements,
        userLevels
      );

      // 2. Calculate overall skill fit
      const fit = skillFit(
        requirements,
        userLevels
      );

      // 3. Check interest alignment
      const interestMatch = interests.includes(
        career.field
      );

      const interestScore = interestMatch ? 1 : 0;

      // 4. Calculate final career match score
      const skillContribution = 0.7 * fit * 100;
      const interestContribution = 0.3 * interestScore * 100;

      const score = Math.round(
        skillContribution + interestContribution
      );

      // 5. Identify missing skills
      const missingSkills = skillGaps.filter(
        (skill) => skill.gap > 0
      );

      // 6. Identify skills already meeting targets
      const readySkills = skillGaps.filter(
        (skill) => skill.gap === 0
      );

      // 7. Sort missing skills by learning priority
      const prioritySkills = [...missingSkills]
        .sort((a, b) => {
          if (b.priority !== a.priority) {
            return b.priority - a.priority;
          }

          return b.gap - a.gap;
        })
        .slice(0, 3);

      // 8. Return recommendation with explanations
      return {
        // Existing fields - do not remove
        id: career.id,
        title: career.title,
        field: career.field,
        description: career.description,
        score,
        skillFit: Math.round(fit * 100),
        interestMatch,
        skillsToDevelop: missingSkills.length,

        // New fields
        requiredSkills: requirements.length,
        readySkills: readySkills.length,
        skillGaps,
        prioritySkills,

        scoreBreakdown: {
          skillContribution: Number(
            skillContribution.toFixed(2)
          ),
          interestContribution: Number(
            interestContribution.toFixed(2)
          )
        }
      };
    })
    .sort((a, b) => b.score - a.score);
}

module.exports = {
  skillFit,
  analyzeSkillGaps,
  rankCareers
};
