
import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function TopicAssignments({ topicId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setAssignments([]);

    api(`/assignments/topics/${topicId}`)
      .then((data) => {
        if (active) setAssignments(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load assignments");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [topicId]);

  function updateAssignment(id, field, value) {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  }

  async function saveAssignment(assignment, status) {
    setSaving(assignment.id);
    setError("");

    try {
      const result = await api(
        `/assignments/${assignment.id}/submit`,
        {
          method: "POST",
          body: {
            submission_url: assignment.submission_url || "",
            notes: assignment.notes || "",
            status
          }
        }
      );

      setAssignments((current) =>
        current.map((item) =>
          item.id === assignment.id
            ? {
                ...item,
                status: result.status,
                submitted_at: result.submitted_at
              }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Unable to save assignment");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h3>Practical Assignments</h3>

      {loading && <p>Loading assignments...</p>}

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {!loading && assignments.length === 0 && (
        <p className="muted">
          No practical assignments available for this topic yet.
        </p>
      )}

      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="card"
          style={{
            padding: 20,
            marginTop: 16,
            border: "1px solid #e5e7eb"
          }}
        >
          <h4>{assignment.title}</h4>

          <p>{assignment.description}</p>

          <p>
            <strong>Difficulty:</strong>{" "}
            {assignment.difficulty}
          </p>

          <h4>Instructions</h4>

          <p style={{ whiteSpace: "pre-line" }}>
            {assignment.instructions}
          </p>

          <label>
            <strong>Project URL</strong>
          </label>

          <input
            type="url"
            placeholder="https://github.com/username/project"
            value={assignment.submission_url || ""}
            onChange={(event) =>
              updateAssignment(
                assignment.id,
                "submission_url",
                event.target.value
              )
            }
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 8,
              marginBottom: 16
            }}
          />

          <label>
            <strong>Notes</strong>
          </label>

          <textarea
            placeholder="Describe what you built..."
            value={assignment.notes || ""}
            onChange={(event) =>
              updateAssignment(
                assignment.id,
                "notes",
                event.target.value
              )
            }
            rows={4}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 8,
              marginBottom: 16
            }}
          />

          <p>
            <strong>Status:</strong>{" "}
            {assignment.status || "Not Started"}
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              disabled={saving !== null}
              onClick={() =>
                saveAssignment(assignment, "in_progress")
              }
            >
              Save Progress
            </button>

            <button
              type="button"
              disabled={saving !== null}
              onClick={() =>
                saveAssignment(assignment, "submitted")
              }
            >
              Submit Assignment
            </button>
          </div>

          {saving === assignment.id && (
            <p>Saving...</p>
          )}
        </div>
      ))}
    </section>
  );
}
