import { useEffect, useState } from "react";
import { api } from "../api.js";
import TopicAssessment from "./TopicAssessment.jsx";
import TopicResources from "./TopicResources.jsx";
import TopicAssignments from "./TopicAssignments.jsx";

export default function Curriculum() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [curriculum, setCurriculum] = useState(null);
  const [openTopic, setOpenTopic] = useState(null);
  const [progress, setProgress] = useState({});
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all available skills and saved student progress.
  useEffect(() => {
    let active = true;

    async function loadSkills() {
      try {
        setSkillsLoading(true);
        setError("");

        const [skillList, savedProgress] = await Promise.all([
          api("/curriculum/skills"),
          api("/curriculum/progress")
        ]);

        if (!active) return;

        setSkills(skillList);

        if (skillList.length > 0) {
          setSelectedSkill(String(skillList[0].id));
        }

        const progressMap = {};

        for (const item of savedProgress) {
          progressMap[item.topic_id] = {
            studied: item.studied,
            practiced: item.practiced
          };
        }

        setProgress(progressMap);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load skills.");
        }
      } finally {
        if (active) {
          setSkillsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      active = false;
    };
  }, []);

  // Load topics when the student selects a skill.
  useEffect(() => {
    if (!selectedSkill) return;

    let active = true;

    async function loadCurriculum() {
      try {
        setLoading(true);
        setError("");
        setCurriculum(null);
        setOpenTopic(null);

        const data = await api(
          `/curriculum/skills/${selectedSkill}`
        );

        if (active) {
          setCurriculum(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load curriculum.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCurriculum();

    return () => {
      active = false;
    };
  }, [selectedSkill]);

  // Save studied and practiced status.
  async function updateProgress(topicId, field, checked) {
    if (saving !== null) return;

    const previous = progress[topicId] || {
      studied: false,
      practiced: false
    };

    setSaving(topicId);
    setError("");

    try {
      const saved = await api(
        `/curriculum/topics/${topicId}/progress`,
        {
          method: "PATCH",
          body: {
            ...previous,
            [field]: checked
          }
        }
      );

      setProgress((current) => ({
        ...current,
        [topicId]: {
          studied: saved.studied,
          practiced: saved.practiced
        }
      }));
    } catch (err) {
      setError(err.message || "Unable to save progress.");
    } finally {
      setSaving(null);
    }
  }

  const topics = curriculum?.topics || [];

  const studiedCount = topics.filter(
    (topic) => progress[topic.id]?.studied
  ).length;

  const practicedCount = topics.filter(
    (topic) => progress[topic.id]?.practiced
  ).length;

  return (
    <section className="curriculum-page">
      <div className="cc-page-header">
        <h1>My Learning Curriculum</h1>

        <p>
          Explore career skills, learn topics and subtopics,
          practice independently, and test your knowledge.
        </p>
      </div>

      {/* Skill selection */}
      <div
        className="card"
        style={{ marginBottom: 24, padding: 20 }}
      >
        <label htmlFor="curriculum-skill">
          <strong>Select a Skill</strong>
        </label>

        <select
          id="curriculum-skill"
          value={selectedSkill}
          disabled={skillsLoading || skills.length === 0}
          onChange={(event) =>
            setSelectedSkill(event.target.value)
          }
          style={{
            display: "block",
            marginTop: 12,
            padding: 12,
            width: "100%",
            maxWidth: 520,
            borderRadius: 8
          }}
        >
          {skillsLoading && (
            <option value="">Loading skills...</option>
          )}

          {!skillsLoading && skills.length === 0 && (
            <option value="">No skills available</option>
          )}

          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name} ({skill.topic_count} topics)
            </option>
          ))}
        </select>

        <p
          className="muted"
          style={{ marginTop: 12 }}
        >
          {skills.length} skills available
        </p>
      </div>

      {/* Loading and errors */}
      {loading && (
        <p>Loading curriculum...</p>
      )}

      {error && (
        <p
          role="alert"
          style={{ color: "#dc2626", marginBottom: 16 }}
        >
          {error}
        </p>
      )}

      {/* Selected skill curriculum */}
      {!loading && curriculum && (
        <>
          <div
            className="card"
            style={{ marginBottom: 20, padding: 20 }}
          >
            <h2>{curriculum.skill.name}</h2>

            <p>
              {topics.length} topics ·{" "}
              {studiedCount} studied ·{" "}
              {practicedCount} practiced
            </p>

            <div
              style={{
                background: "#e5e7eb",
                height: 10,
                borderRadius: 10,
                overflow: "hidden",
                marginTop: 14
              }}
            >
              <div
                style={{
                  width: `${
                    topics.length
                      ? (studiedCount / topics.length) * 100
                      : 0
                  }%`,
                  height: "100%",
                  background: "#0d9488",
                  transition: "width 0.3s"
                }}
              />
            </div>

            <p
              className="muted"
              style={{ marginTop: 8 }}
            >
              {topics.length
                ? Math.round(
                    (studiedCount / topics.length) * 100
                  )
                : 0}
              % topics marked as studied
            </p>
          </div>

          {topics.length === 0 && (
            <div className="card">
              <p>
                No curriculum has been added for this skill yet.
              </p>
            </div>
          )}

          {/* Topics */}
          <div
            style={{
              display: "grid",
              gap: 14
            }}
          >
            {topics.map((topic) => {
              const isOpen = openTopic === topic.id;

              const topicProgress = progress[topic.id] || {
                studied: false,
                practiced: false
              };

              return (
                <article
                  className="card"
                  key={topic.id}
                  style={{ padding: 18 }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenTopic(
                        isOpen ? null : topic.id
                      )
                    }
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "inherit",
                      padding: 0
                    }}
                  >
                    <strong>
                      {topic.position}. {topic.title}
                    </strong>

                    <span aria-hidden="true">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ marginTop: 18 }}>
                      {topic.description && (
                        <p>{topic.description}</p>
                      )}

                      <p className="muted">
                        Estimated study time:{" "}
                        {topic.estimated_hours} hours
                      </p>

                      <h3>What You Will Learn</h3>

                      <ul
                        style={{
                          lineHeight: 1.9,
                          paddingLeft: 24
                        }}
                      >
                        {topic.subtopics.map(
                          (subtopic) => (
                            <li key={subtopic.id}>
                              {subtopic.title}
                            </li>
                          )
                        )}
                      </ul>

                      {/* Progress controls */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 24,
                          marginTop: 20,
                          padding: 14,
                          border: "1px solid #d1d5db",
                          borderRadius: 10
                        }}
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={topicProgress.studied}
                            disabled={saving !== null}
                            onChange={(event) =>
                              updateProgress(
                                topic.id,
                                "studied",
                                event.target.checked
                              )
                            }
                          />
                          {" "}Studied
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={topicProgress.practiced}
                            disabled={saving !== null}
                            onChange={(event) =>
                              updateProgress(
                                topic.id,
                                "practiced",
                                event.target.checked
                              )
                            }
                          />
                          {" "}Practiced
                        </label>
                      </div>

                      {saving === topic.id && (
                        <p className="muted">
                          Saving progress...
                        </p>
                      )}

                      {/* Topic-wise assessment */}
                      <TopicResources topicId={topic.id} />
                      <TopicAssessment
                        key={topic.id}
                        topicId={topic.id}
                      />
                      <TopicAssignments
                   key={`assignments-${topic.id}`}
                topicId={topic.id}
                  />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <p
            className="muted"
            style={{ marginTop: 24 }}
          >
            Studied and Practiced are self-reported.
            The progress bar reflects topics marked as studied,
            not verified mastery. Starter assessment questions
            require further validation.
          </p>
        </>
      )}
    </section>
  );
}

