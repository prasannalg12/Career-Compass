
import { useEffect, useState } from "react";
import { api } from "../api.js";
import TopicAssessment from "./TopicAssessment.jsx";
import TopicResources from "./TopicResources.jsx";

export default function SkillCurriculum({ skillId }) {
  const [expanded, setExpanded] = useState(false);
  const [curriculum, setCurriculum] = useState(null);
  const [progress, setProgress] = useState({});
  const [openTopic, setOpenTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingTopic, setSavingTopic] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!expanded || !skillId || curriculum) return;

    let active = true;

    async function loadCurriculum() {
      setLoading(true);
      setError("");

      try {
        const [data, savedProgress] = await Promise.all([
          api(`/curriculum/skills/${skillId}`),
          api("/curriculum/progress")
        ]);

        if (!active) return;

        setCurriculum(data);

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
          setError(err.message || "Unable to load curriculum.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCurriculum();

    return () => {
      active = false;
    };
  }, [expanded, skillId, curriculum]);

  async function updateProgress(topicId, field, checked) {
    if (savingTopic !== null) return;

    const previous = progress[topicId] || {
      studied: false,
      practiced: false
    };

    const updated = {
      ...previous,
      [field]: checked
    };

    setSavingTopic(topicId);
    setError("");

    try {
      const saved = await api(
        `/curriculum/topics/${topicId}/progress`,
        {
          method: "PATCH",
          body: updated
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
      setSavingTopic(null);
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
    <div
      className="card"
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          border: "none",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          textAlign: "left",
          padding: 0
        }}
      >
        <strong>Explore complete skill curriculum</strong>
        <span aria-hidden="true">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: 16 }}>
          {loading && <p>Loading topics...</p>}

          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}

          {!loading && curriculum && (
            <>
              <h4>{curriculum.skill.name}</h4>

              <p className="muted">
                {topics.length} topics ·
                {" "}{studiedCount} studied ·
                {" "}{practicedCount} practiced
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginTop: 16
                }}
              >
                {topics.map((topic) => {
                  const isOpen = openTopic === topic.id;

                  const topicProgress = progress[topic.id] || {
                    studied: false,
                    practiced: false
                  };

                  return (
                    <div
                      key={topic.id}
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: 10,
                        padding: 14
                      }}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenTopic(isOpen ? null : topic.id)
                        }
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          color: "inherit",
                          cursor: "pointer",
                          textAlign: "left",
                          gap: 10
                        }}
                      >
                        <strong>
                          {topic.position}. {topic.title}
                        </strong>

                        <span aria-hidden="true">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div style={{ marginTop: 14 }}>
                          <p className="muted">
                            Estimated study time:{" "}
                            {topic.estimated_hours} hours
                          </p>

                          <h4>Topics to learn</h4>

                          <ul style={{ lineHeight: 1.9 }}>
                            {topic.subtopics.map((subtopic) => (
                              <li key={subtopic.id}>
                                {subtopic.title}
                              </li>
                            ))}
                          </ul>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 20,
                              marginTop: 16
                            }}
                          >
                            <label>
                              <input
                                type="checkbox"
                                checked={topicProgress.studied}
                                disabled={savingTopic !== null}
                                onChange={(e) =>
                                  updateProgress(
                                    topic.id,
                                    "studied",
                                    e.target.checked
                                  )
                                }
                              />
                              {" "}Studied
                            </label>

                            <label>
                              <input
                                type="checkbox"
                                checked={topicProgress.practiced}
                                disabled={savingTopic !== null}
                                onChange={(e) =>
                                  updateProgress(
                                    topic.id,
                                    "practiced",
                                    e.target.checked
                                  )
                                }
                              />
                              {" "}Practiced
                            </label>
                          </div>

                          {savingTopic === topic.id && (
                            <p className="muted">Saving progress...</p>
                          )}
                          <TopicResources topicId={topic.id} />
                      <TopicAssessment topicId={topic.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="muted" style={{ marginTop: 16 }}>
                Studied and practiced are self-reported.
                Assessment-based mastery will be tracked separately.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
