
function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

// Calculate the priority of each missing skill.
function calculatePriority(gap) {
  const current = Math.max(
    0,
    safeNumber(gap.current)
  );

  const required = Math.max(
    1,
    safeNumber(gap.required, 1)
  );

  const importance = Math.max(
    0,
    safeNumber(gap.importance, 1)
  );

  const missingLevels = Math.max(
    0,
    required - current
  );

  const gapRatio = missingLevels / required;

  // More important skills with larger gaps come first.
  const priorityScore = importance * gapRatio;

  return {
    ...gap,
    current,
    required,
    importance,
    missingLevels,
    priorityScore
  };
}

// Generate a personalized learning roadmap.
function buildPlan(gaps, resources, weeklyHours) {
  const perWeek = Math.max(
    1,
    safeNumber(weeklyHours, 5)
  );

  let cumulative = 0;

  // Prioritize skills before scheduling learning tasks.
  const prioritizedGaps = gaps
    .map(calculatePriority)
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }

      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }

      return a.skillId - b.skillId;
    });

  return prioritizedGaps.map((gap, index) => {
    const tasks = resources
      .filter(
        (resource) =>
          resource.skillId === gap.skillId &&
          resource.level > gap.current &&
          resource.level <= gap.required
      )
      .sort(
        (a, b) =>
          a.level - b.level ||
          a.id - b.id
      )
      .map((resource) => {
        const hours = Math.max(
          0,
          safeNumber(resource.estHours)
        );

        cumulative += hours;

        return {
          resourceId: resource.id,
          title: resource.title,
          type: resource.type,
          level: resource.level,
          estHours: hours,
          dueWeek: Math.max(
            1,
            Math.ceil(cumulative / perWeek)
          )
        };
      });

    // Add a skill assessment after learning resources.
    cumulative += 1;

    tasks.push({
      resourceId: null,
      title: "Skill check: " + gap.name,
      type: "assessment",
      level: gap.required,
      estHours: 1,
      dueWeek: Math.max(
        1,
        Math.ceil(cumulative / perWeek)
      )
    });

    return {
      skillId: gap.skillId,
      name: gap.name,
      targetLevel: gap.required,
      position: index + 1,
      priorityScore: gap.priorityScore,
      tasks
    };
  });
}

// Reschedule unfinished tasks.
function rebalanceWeeks(
  todoTasks,
  currentWeek,
  weeklyHours
) {
  const perWeek = Math.max(
    1,
    safeNumber(weeklyHours, 5)
  );

  const startWeek = Math.max(
    1,
    safeNumber(currentWeek, 1)
  );

  let cumulative = 0;

  return todoTasks.map((task) => {
    cumulative += Math.max(
      0,
      safeNumber(task.estHours)
    );

    return {
      id: task.id,
      dueWeek:
        startWeek +
        Math.max(
          1,
          Math.ceil(cumulative / perWeek)
        ) -
        1
    };
  });
}

module.exports = {
  calculatePriority,
  buildPlan,
  rebalanceWeeks
};

