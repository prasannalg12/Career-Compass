
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const clamp = (value) =>
  Math.max(0, Math.min(100, Number(value) || 0));

function CareerIcon({ field }) {
  return (
    <span aria-hidden="true">
      {field === "Technology"
        ? "💻"
        : field === "Data"
        ? "📊"
        : field === "Design"
        ? "🎨"
        : "💼"}
    </span>
  );
}

function SkillProgress({ current, required }) {
  const percentage =
    Number(required) > 0
      ? clamp((Number(current) / Number(required)) * 100)
      : 100;

  return (
    <div className="cc-skill-progress">
      <div
        className="cc-skill-progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function Careers({ onChosen }) {
  const [careers, setCareers] = useState([]);
  const [search, setSearch] = useState("");
  const [field, setField] = useState("All");
  const [open, setOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creating, setCreating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api("/careers/recommendations")
      .then((data) => {
        if (active) {
          setCareers(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fields = useMemo(
    () => [
      "All",
      ...new Set(careers.map((c) => c.field).filter(Boolean))
    ],
    [careers]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return careers.filter((career) => {
      const matchesSearch =
        (career.title || "").toLowerCase().includes(term) ||
        (career.description || "").toLowerCase().includes(term) ||
        (career.field || "").toLowerCase().includes(term);

      const matchesField =
        field === "All" || career.field === field;

      return matchesSearch && matchesField;
    });
  }, [careers, search, field]);

  async function toggle(id) {
    if (open === id) {
      setOpen(null);
      setDetail(null);
      return;
    }

    setOpen(id);
    setDetail(null);
    setDetailLoading(true);
    setError("");

    try {
      const data = await api(`/careers/${id}`);
      setDetail(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function choose(id) {
    setCreating(id);
    setError("");

    try {
      await api("/roadmaps", {
        method: "POST",
        body: { careerId: id }
      });

      if (onChosen) onChosen();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(null);
    }
  }

  function getSkillName(skillId) {
    const skill = detail?.skills?.find(
      (item) => String(item.id) === String(skillId)
    );

    return skill?.name || `Skill #${skillId}`;
  }

  return (
    <div className="careers-page">
      <section className="careers-hero">
        <span className="careers-eyebrow">
          CAREERCOMPASS / EXPLORE
        </span>

        <h2>Discover your career path</h2>

        <p>
          Explore personalized career recommendations,
          understand your skill gaps, and build a
          development roadmap.
        </p>
      </section>

      <section className="careers-toolbar">
        <div className="careers-toolbar-top">
          <div>
            <h3>Explore opportunities</h3>
            <p className="muted">
              Ranked using your interests and current
              skill levels.
            </p>
          </div>

          <span className="careers-count">
            {filtered.length} careers
          </span>
        </div>

        <label className="careers-search-label">
          Search careers
          <input
            className="careers-search"
            type="search"
            placeholder="Search by career or field..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div
          className="careers-filters"
          aria-label="Filter careers by field"
        >
          {fields.map((item) => (
            <button
              key={item}
              type="button"
              className={
                field === item
                  ? "career-filter active"
                  : "career-filter"
              }
              aria-pressed={field === item}
              onClick={() => setField(item)}
            >
              {item === "All" ? "All fields" : item}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted" role="status">
          Loading career recommendations...
        </p>
      ) : filtered.length === 0 ? (
        <div className="careers-empty">
          <h3>No careers found</h3>
          <p>Try another search or field.</p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setField("All");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="careers-grid">
          {filtered.map((career) => {
            const score = clamp(career.score);
            const fit = clamp(career.skillFit);

            const prioritySkills = Array.isArray(
              career.prioritySkills
            )
              ? career.prioritySkills
              : [];

            const skillGaps = Array.isArray(
              career.skillGaps
            )
              ? career.skillGaps
              : [];

            const expanded = open === career.id;

            const selectedDetail =
              expanded &&
              detail &&
              String(detail.id) === String(career.id)
                ? detail
                : null;

            return (
              <article
                className="career-card"
                key={career.id}
              >
                <div className="career-card-top">
                  <div className="career-symbol">
                    <CareerIcon field={career.field} />
                  </div>

                  <span className="career-match">
                    {score}% match
                  </span>
                </div>

                <span className="career-field">
                  {career.field}
                </span>

                <h3>{career.title}</h3>

                <p className="career-description">
                  {career.description}
                </p>

                <div className="career-progress">
                  <div className="career-progress-label">
                    <span>Career match</span>
                    <strong>{score}%</strong>
                  </div>

                  <div className="career-progress-track">
                    <div
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                <div className="cc-match-stats">
                  <div className="cc-match-stat">
                    <span>Skill compatibility</span>
                    <strong>{fit}%</strong>
                  </div>

                  <div className="cc-match-stat">
                    <span>Skills to develop</span>
                    <strong>
                      {career.skillsToDevelop ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="cc-interest-row">
                  <span
                    className={
                      career.interestMatch
                        ? "cc-interest-tag matched"
                        : "cc-interest-tag"
                    }
                  >
                    {career.interestMatch
                      ? "✓ Matches your interests"
                      : "No direct interest match"}
                  </span>
                </div>

                {prioritySkills.length > 0 && (
                  <div className="cc-priority-preview">
                    <h4>Top learning priorities</h4>
                    <p className="muted">
                      Open requirements to see the
                      recommended skills.
                    </p>
                    <span className="cc-priority-count">
                      {prioritySkills.length} priority skills
                    </span>
                  </div>
                )}

                <div className="career-actions">
                  <button
                    type="button"
                    className="career-details-button"
                    onClick={() => toggle(career.id)}
                    aria-expanded={expanded}
                  >
                    {expanded
                      ? "Hide skill analysis"
                      : "View skill analysis"}
                  </button>

                  <button
                    type="button"
                    className="primary career-roadmap-button"
                    disabled={creating !== null}
                    onClick={() => choose(career.id)}
                  >
                    {creating === career.id
                      ? "Creating..."
                      : "Build roadmap →"}
                  </button>
                </div>

                {expanded && (
                  <div className="career-requirements">
                    {detailLoading ? (
                      <p className="muted">
                        Loading skill analysis...
                      </p>
                    ) : !selectedDetail ? (
                      <p className="muted">
                        Career details unavailable.
                        Try opening them again.
                      </p>
                    ) : (
                      <>
                        <h4>Why this career?</h4>

                        <div className="cc-score-breakdown">
                          <div>
                            <span>Skills contribution</span>
                            <strong>
                              {career.scoreBreakdown
                                ?.skillContribution ?? "—"}
                              /70
                            </strong>
                          </div>

                          <div>
                            <span>Interest contribution</span>
                            <strong>
                              {career.scoreBreakdown
                                ?.interestContribution ?? "—"}
                              /30
                            </strong>
                          </div>
                        </div>

                        {selectedDetail.education_path && (
                          <>
                            <h4>Typical education path</h4>
                            <p>
                              {selectedDetail.education_path}
                            </p>
                          </>
                        )}

                        {prioritySkills.length > 0 && (
                          <>
                            <h4>Recommended learning order</h4>

                            <ol className="cc-priority-list">
                              {prioritySkills.map((skill) => (
                                <li key={skill.skillId}>
                                  <div>
                                    <strong>
                                      {getSkillName(
                                        skill.skillId
                                      )}
                                    </strong>
                                    <span>
                                      Level {skill.currentLevel}
                                      {" → "}
                                      {skill.requiredLevel}
                                    </span>
                                  </div>
                                  <small>
                                    Priority {skill.priority}
                                  </small>
                                </li>
                              ))}
                            </ol>
                          </>
                        )}

                        <h4>Required skills</h4>

                        <div className="cc-skills-list">
                          {(selectedDetail.skills || []).map(
                            (skill) => {
                              const gapInfo = skillGaps.find(
                                (item) =>
                                  String(item.skillId) ===
                                  String(skill.id)
                              );

                              const current =
                                gapInfo?.currentLevel ?? 0;

                              const required =
                                skill.requiredLevel;

                              const ready =
                                current >= required;

                              return (
                                <div
                                  className="cc-skill-item"
                                  key={skill.id}
                                >
                                  <div className="cc-skill-heading">
                                    <strong>{skill.name}</strong>
                                    <span
                                      className={
                                        ready
                                          ? "cc-skill-ready"
                                          : "cc-skill-gap"
                                      }
                                    >
                                      {gapInfo
                                        ? ready
                                          ? "Ready"
                                          : `Gap: ${gapInfo.gap}`
                                        : "Level not loaded"}
                                    </span>
                                  </div>

                                  <p>
                                    Current: {gapInfo
                                      ? current
                                      : "—"}
                                    /5 · Required: {required}/5
                                  </p>

                                  {gapInfo && (
                                    <SkillProgress
                                      current={current}
                                      required={required}
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

