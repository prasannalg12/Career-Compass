
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Quiz from "./Quiz.jsx";
import SkillCurriculum from "./SkillCurriculum.jsx";

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function ProgressBar({ value, label }) {
  const percent = Math.max(0, Math.min(100, safeNumber(value)));

  return (
    <div
      className="roadmap-progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function Roadmap({ goToCareers }) {
  const [rm, setRm] = useState(undefined);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    try {
      const data = await api("/roadmaps/current");
      setRm(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load roadmap.");
      setRm((previous) =>
        previous === undefined ? null : previous
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  const milestones = Array.isArray(rm?.milestones)
    ? rm.milestones
    : [];

  const currentWeek = safeNumber(rm?.currentWeek);

  const allTasks = useMemo(
    () => milestones.flatMap((milestone) =>
      (milestone.tasks || []).map((task) => ({
        ...task,
        milestoneName: milestone.name
      }))
    ),
    [rm]
  );

  const weeklyTasks = allTasks.filter(
    (task) =>
      safeNumber(task.dueWeek) === currentWeek &&
      task.status !== "skipped"
  );

  const weeklyDone = weeklyTasks.filter(
    (task) => task.status === "done"
  ).length;

  const weeklyTotal = weeklyTasks.length;

  const weeklyPercent = weeklyTotal
    ? Math.round((weeklyDone / weeklyTotal) * 100)
    : 0;

  const completedTasks = allTasks.filter(
    (task) => task.status === "done"
  ).length;

  const remainingTasks = allTasks.filter(
    (task) =>
      task.status !== "done" &&
      task.status !== "skipped"
  ).length;

  const totalHoursRemaining = allTasks
    .filter(
      (task) =>
        task.status !== "done" &&
        task.status !== "skipped"
    )
    .reduce(
      (sum, task) => sum + safeNumber(task.estHours),
      0
    );

  const visibleMilestones = milestones
    .map((milestone) => {
      const tasks = milestone.tasks || [];

      let filteredTasks = tasks;

      if (filter === "week") {
        filteredTasks = tasks.filter(
          (task) =>
            safeNumber(task.dueWeek) === currentWeek
        );
      }

      if (filter === "pending") {
        filteredTasks = tasks.filter(
          (task) =>
            task.status !== "done" &&
            task.status !== "skipped"
        );
      }

      return {
        ...milestone,
        visibleTasks: filteredTasks
      };
    })
    .filter(
      (milestone) =>
        filter === "all" ||
        milestone.visibleTasks.length > 0
    );

  async function toggleTask(task) {
    if (busy || task.status === "skipped") return;

    setBusy(true);
    setError("");

    try {
      await api(`/roadmaps/tasks/${task.id}`, {
        method: "PATCH",
        body: {
          status:
            task.status === "done" ? "todo" : "done"
        }
      });

      await load();
    } catch (err) {
      setError(err.message || "Could not update task.");
    } finally {
      setBusy(false);
    }
  }

  async function rebalance() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await api("/roadmaps/current/rebalance", {
        method: "POST"
      });

      await load();
    } catch (err) {
      setError(
        err.message || "Could not reschedule tasks."
      );
    } finally {
      setBusy(false);
    }
  }

  if (quiz) {
    return (
      <Quiz
        skillId={quiz.skillId}
        skillName={quiz.name}
        onClose={() => setQuiz(null)}
        onDone={() => {
          setQuiz(null);
          load();
        }}
      />
    );
  }

  if (rm === undefined) {
    return (
      <div className="roadmap-page">
        <p role="status">Loading your roadmap...</p>
      </div>
    );
  }

  if (rm === null) {
    return (
      <div className="roadmap-page">
        <section className="roadmap-empty">
          <div className="roadmap-empty-icon">🧭</div>
          <h2>Your journey starts here</h2>
          <p>
            Choose a career to generate your
            personalized learning roadmap.
          </p>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary"
            onClick={goToCareers}
          >
            Explore careers →
          </button>

          {error && (
            <button type="button" onClick={load}>
              Try again
            </button>
          )}
        </section>
      </div>
    );
  }

  const overallPercent = Math.max(
    0,
    Math.min(100, safeNumber(rm.progress?.percent))
  );

  return (
    <div className="roadmap-page">
      <section className="roadmap-hero">
        <span className="roadmap-eyebrow">
          CAREERCOMPASS / MY ROADMAP
        </span>

        <h2>Your path to {rm.careerTitle}</h2>

        <p>
          Build your skills, complete learning activities,
          and measure your progress toward your career.
        </p>

        <div className="roadmap-hero-progress">
          <div className="roadmap-progress-label">
            <span>Overall roadmap progress</span>
            <strong>{overallPercent}%</strong>
          </div>

          <ProgressBar
            value={overallPercent}
            label="Overall roadmap progress"
          />
        </div>
      </section>

      <div className="roadmap-stats">
        <div className="roadmap-stat">
          <span className="roadmap-stat-icon">✓</span>
          <strong>{completedTasks}</strong>
          <span>Completed tasks</span>
        </div>

        <div className="roadmap-stat">
          <span className="roadmap-stat-icon">☷</span>
          <strong>{remainingTasks}</strong>
          <span>Remaining tasks</span>
        </div>

        <div className="roadmap-stat">
          <span className="roadmap-stat-icon">▦</span>
          <strong>{rm.currentWeek}</strong>
          <span>Current week</span>
        </div>
      </div>

      <section className="cc-weekly-card">
        <div className="cc-weekly-heading">
          <div>
            <span className="cc-section-eyebrow">
              YOUR WEEKLY FOCUS
            </span>
            <h3>Week {rm.currentWeek} learning plan</h3>
            <p>
              Focus on the activities scheduled for
              your current week.
            </p>
          </div>

          <span className="cc-weekly-percent">
            {weeklyPercent}%
          </span>
        </div>

        <ProgressBar
          value={weeklyPercent}
          label="Current week progress"
        />

        <div className="cc-weekly-metrics">
          <span>
            <strong>{weeklyDone}/{weeklyTotal}</strong>
            {" "}tasks completed
          </span>

          <span>
            <strong>
              {Number(totalHoursRemaining.toFixed(1))}
            </strong>
            {" "}hours remaining in roadmap
          </span>
        </div>
      </section>

      <section className="cc-roadmap-controls">
        <div>
          <h3>Your learning milestones</h3>
          <p className="muted">
            Complete learning resources and assessments
            to advance your skills.
          </p>
        </div>

        <button
          type="button"
          className="roadmap-rebalance"
          onClick={rebalance}
          disabled={busy}
        >
          {busy ? "Please wait..." : "↻ Reschedule tasks"}
        </button>
      </section>

      <div
        className="cc-roadmap-filters"
        aria-label="Filter roadmap tasks"
      >
        {[
          ["all", "All tasks"],
          ["week", "This week"],
          ["pending", "To complete"]
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={
              filter === id
                ? "cc-roadmap-filter active"
                : "cc-roadmap-filter"
            }
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {visibleMilestones.length === 0 ? (
        <div className="cc-roadmap-no-tasks">
          <h3>No tasks in this view</h3>
          <p>
            Try another filter to see your learning plan.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
          >
            Show all tasks
          </button>
        </div>
      ) : (
        <div className="roadmap-milestones">
          {visibleMilestones.map((milestone, index) => {
            const tasks = milestone.tasks || [];

            const done = tasks.filter(
              (task) => task.status === "done"
            ).length;

            const total = tasks.length;

            const milestonePercent = total
              ? Math.round((done / total) * 100)
              : 0;

            return (
              <article
                key={milestone.id}
                className={
                  milestone.status === "done"
                    ? "roadmap-milestone completed"
                    : "roadmap-milestone"
                }
              >
                <div className="milestone-heading">
                  <div className="milestone-number">
                    {milestone.status === "done"
                      ? "✓"
                      : milestones.indexOf(milestone) + 1}
                  </div>

                  <div className="milestone-title">
                    <h4>{milestone.name}</h4>
                    <span
  className={
    "cc-priority-badge " +
    (milestone.priorityLabel || "Low").toLowerCase()
  }
>
  {milestone.priorityLabel || "Not rated"} priority
</span>
                    <p>
                      Level {milestone.currentLevel} of{" "}
                      {milestone.targetLevel} required
                    </p>
                  </div>

                  <span className="milestone-count">
                    {done}/{total} tasks
                  </span>
                </div>

                <div className="cc-milestone-progress">
                  <ProgressBar
                    value={milestonePercent}
                    label={`${milestone.name} task completion`}
                  />
                  <small>
                    {milestonePercent}% of tasks completed
                  </small>
                </div>

                <div className="milestone-tasks">
                  {milestone.visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={
                        "milestone-task " + task.status
                      }
                    >
                      {task.type === "assessment" ? (
                        <div className="assessment-task">
                          <span className="assessment-icon">
                            📝
                          </span>

                          <div className="task-content">
                            <strong>{task.title}</strong>
                            <small>
                              Week {task.dueWeek} ·{" "}
                              {task.estHours}h
                            </small>
                          </div>

                          <button
                            type="button"
                            className="primary"
                            disabled={
                              busy ||
                              task.status === "done" ||
                              task.status === "skipped"
                            }
                            onClick={() =>
                              setQuiz({
                                skillId: milestone.skillId,
                                name: milestone.name
                              })
                            }
                          >
                            {task.status === "done"
                              ? "Completed"
                              : task.status === "skipped"
                              ? "Skipped"
                              : "Take skill check"}
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            aria-label={task.title}
                            checked={task.status === "done"}
                            disabled={
                              busy ||
                              task.status === "skipped"
                            }
                            onChange={() => toggleTask(task)}
                          />

                          <div className="task-content">
                            {task.url ? (
                              <a
                                href={task.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {task.title} ↗
                              </a>
                            ) : (
                              <strong>{task.title}</strong>
                            )}

                            <small>
                              Week {task.dueWeek} ·{" "}
                              {task.estHours}h
                            </small>

                            {task.status === "skipped" && (
                              <small>
                                Skipped based on your
                                skill level
                              </small>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <SkillCurriculum skillId={milestone.skillId} />
              </article>
            );
          })}
        </div>
      )}

      <section className="roadmap-changes">
        <div className="roadmap-changes-title">
          <span>✦</span>
          <div>
            <h3>Why your plan changed</h3>
            <p>
              Understand how your learning progress
              affects your roadmap.
            </p>
          </div>
        </div>

        {(rm.changes || []).length === 0 ? (
          <p className="muted">
            No adjustments yet. Complete a skill
            assessment to see personalized updates.
          </p>
        ) : (
          <ul>
            {rm.changes.map((change, index) => (
              <li key={index}>{change.reason}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
