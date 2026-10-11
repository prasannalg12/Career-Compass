
import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const LABELS = [
  "None", "Aware", "Beginner",
  "Working", "Strong", "Expert"
];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [levels, setLevels] = useState({});
  const [sources, setSources] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      api("/skills"),
      api("/skills/mine")
    ])
      .then(([all, mine]) => {
        if (!active) return;

        setSkills(all);
        setLevels(
          Object.fromEntries(
            mine.map(s => [s.skillId, s.level])
          )
        );
        setSources(
          Object.fromEntries(
            mine.map(s => [s.skillId, s.source])
          )
        );
      })
      .catch(err => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const grouped = useMemo(() => {
    const result = {};

    skills
      .filter(s =>
        `${s.name} ${s.category}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .forEach(s => {
        const category = s.category || "Other";
        if (!result[category]) result[category] = [];
        result[category].push(s);
      });

    return result;
  }, [skills, search]);

  const rated = skills.filter(
    s => Number(levels[s.id] || 0) > 0
  ).length;

  const assessed = skills.filter(
    s => sources[s.id] === "assessed"
  ).length;

  const average = skills.length
    ? (
        skills.reduce(
          (sum, s) => sum + Number(levels[s.id] || 0),
          0
        ) / skills.length
      ).toFixed(1)
    : "0.0";

  function updateLevel(id, value) {
    setLevels(prev => ({
      ...prev,
      [id]: Number(value)
    }));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = skills
        .filter(s => sources[s.id] !== "assessed")
        .map(s => ({
          skillId: s.id,
          level: Number(levels[s.id] || 0)
        }));

      await api("/skills/mine", {
        method: "PUT",
        body: { skills: payload }
      });

      setMessage(
        "Skills saved! Your career matches are updated."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="skills-page">
      <section className="skills-hero">
        <span className="skills-eyebrow">
          CAREERCOMPASS / MY SKILLS
        </span>
        <h2>Understand your strengths</h2>
        <p>
          Assess your current abilities, track
          proficiency and discover areas to improve.
        </p>
      </section>

      <div className="skills-stats">
        <div className="skills-stat">
          <span>📚</span>
          <strong>{skills.length}</strong>
          <small>Total skills</small>
        </div>
        <div className="skills-stat">
          <span>🎯</span>
          <strong>{rated}</strong>
          <small>Rated skills</small>
        </div>
        <div className="skills-stat">
          <span>✓</span>
          <strong>{assessed}</strong>
          <small>Assessed skills</small>
        </div>
        <div className="skills-stat">
          <span>📈</span>
          <strong>{average}/5</strong>
          <small>Average level</small>
        </div>
      </div>

      <section className="skills-toolbar">
        <div>
          <h3>Skill proficiency</h3>
          <p>
            Select your current level for each skill.
            Assessed levels cannot be edited here.
          </p>
        </div>

        <input
          type="search"
          aria-label="Search skills"
          placeholder="Search skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? (
        <p role="status">Loading skills...</p>
      ) : (
        <>
          {Object.entries(grouped).map(
            ([category, items]) => (
              <section
                className="skills-category"
                key={category}
              >
                <div className="skills-category-header">
                  <h3>{category}</h3>
                  <span>{items.length} skills</span>
                </div>

                {items.map(skill => {
                  const level = Number(
                    levels[skill.id] || 0
                  );
                  const verified =
                    sources[skill.id] === "assessed";

                  return (
                    <div
                      className="skills-item"
                      key={skill.id}
                    >
                      <div className="skills-item-header">
                        <div>
                          <h4>{skill.name}</h4>
                          <small>
                            {verified
                              ? "✓ Assessed level"
                              : "Self-rated level"}
                          </small>
                        </div>
                        <strong>Level {level}/5</strong>
                      </div>

                      <div
                        className="skills-track"
                        role="progressbar"
                        aria-label={`${skill.name} proficiency`}
                        aria-valuenow={level}
                        aria-valuemin={0}
                        aria-valuemax={5}
                      >
                        <div
                          style={{
                            width: `${level * 20}%`
                          }}
                        />
                      </div>

                      <div className="skills-item-footer">
                        <span>{LABELS[level]}</span>

                        <select
                          aria-label={`Rate ${skill.name}`}
                          value={level}
                          disabled={verified || saving}
                          onChange={e =>
                            updateLevel(
                              skill.id,
                              e.target.value
                            )
                          }
                        >
                          {LABELS.map((label, i) => (
                            <option key={i} value={i}>
                              {i} – {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </section>
            )
          )}

          {Object.keys(grouped).length === 0 && (
            <div className="skills-category">
              <p>No matching skills found.</p>
            </div>
          )}

          <div className="skills-save-bar">
            <p>
              Your self-ratings help personalize
              career recommendations.
            </p>
            <button
              className="primary"
              disabled={saving}
              onClick={save}
            >
              {saving ? "Saving..." : "Save skills →"}
            </button>
          </div>

          {message && (
            <p className="ok" role="status">{message}</p>
          )}
        </>
      )}
    </div>
  );
}
