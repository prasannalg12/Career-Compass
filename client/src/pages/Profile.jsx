
import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Profile({ user, onSaved }) {
  const [fields, setFields] = useState([]);
  const [education, setEducation] = useState(user.education || "");
  const [hours, setHours] = useState(user.weeklyHours || 5);
  const [interests, setInterests] = useState(user.interests || []);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/careers")
      .then((careers) => {
        const uniqueFields = [
          ...new Set(careers.map((career) => career.field))
        ];
        setFields(uniqueFields);
      })
      .catch(() => setError("Unable to load career fields."));
  }, []);

  function toggleInterest(field) {
    setInterests((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    );
  }

  async function save(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setSaving(true);

    try {
      const updatedUser = await api("/auth/me", {
        method: "PUT",
        body: {
          education,
          interests,
          weeklyHours: Number(hours)
        }
      });

      onSaved(updatedUser);
      setMsg("Your profile has been saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">

      <section className="profile-hero">
        <span className="profile-eyebrow">
          CAREERCOMPASS / MY PROFILE
        </span>

        <h2>Build your career profile</h2>

        <p>
          Tell us about your background, interests and
          learning availability to personalize your career journey.
        </p>
      </section>

      <form className="profile-card" onSubmit={save}>

        <div className="profile-section-heading">
          <span className="profile-icon">🎓</span>
          <div>
            <h3>Your background</h3>
            <p>Help us understand where you're starting.</p>
          </div>
        </div>

        <div className="profile-form-grid">
          <label>
            Education or current role
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.Tech student"
            />
          </label>

          <label>
            Weekly study hours
            <input
              type="number"
              min="1"
              max="60"
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </label>
        </div>

        <div className="profile-divider" />

        <div className="profile-section-heading">
          <span className="profile-icon">💡</span>
          <div>
            <h3>Your interests</h3>
            <p>Select the fields that interest you.</p>
          </div>
        </div>

        <fieldset className="profile-interests">
          <legend className="sr-only">Career interests</legend>

          {fields.map((field) => (
            <label
              key={field}
              className={
                interests.includes(field)
                  ? "interest-option selected"
                  : "interest-option"
              }
            >
              <input
                type="checkbox"
                checked={interests.includes(field)}
                onChange={() => toggleInterest(field)}
              />
              <span>{field}</span>
            </label>
          ))}
        </fieldset>

        <div className="profile-footer">
          <p>
            Your profile helps personalize your career recommendations.
          </p>

          <button
            type="submit"
            className="primary profile-save"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save profile →"}
          </button>
        </div>

        {msg && <p className="ok" role="status">{msg}</p>}
        {error && <p className="error" role="alert">{error}</p>}

      </form>
    </div>
  );
}
