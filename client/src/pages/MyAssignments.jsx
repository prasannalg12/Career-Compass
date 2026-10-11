
import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api("/assignments/my")
      .then((data) => setAssignments(data))
      .catch((err) =>
        setError(err.message || "Failed to load assignments")
      )
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    all: assignments.length,
    not_started: assignments.filter(
      (a) => a.status === "not_started"
    ).length,
    in_progress: assignments.filter(
      (a) => a.status === "in_progress"
    ).length,
    submitted: assignments.filter(
      (a) => a.status === "submitted"
    ).length,
  };

  const filtered = assignments.filter(
    (a) => filter === "all" || a.status === filter
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>My Assignments</h1>
      <p>Track your practical projects and submissions.</p>

      {loading && <p>Loading assignments...</p>}

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            {[
              ["all", "All"],
              ["not_started", "Not Started"],
              ["in_progress", "In Progress"],
              ["submitted", "Submitted"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                style={{
                  padding: "12px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background:
                    filter === value ? "#2563eb" : "#e5e7eb",
                  color: filter === value ? "white" : "#111827",
                  border: "none",
                }}
              >
                {label} ({counts[value]})
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p>No assignments found in this category.</p>
          )}

          {filtered.map((assignment) => (
            <div
              key={assignment.id}
              className="card"
              style={{
                padding: 20,
                marginBottom: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
              }}
            >
              <h3>{assignment.title}</h3>

              <p>
                <strong>Topic:</strong> {assignment.topic_name}
              </p>

              <p>{assignment.description}</p>

              <p>
                <strong>Difficulty:</strong>{" "}
                {assignment.difficulty}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {assignment.status.replaceAll("_", " ")}
              </p>

              {assignment.submission_url && (
                <p>
                  <a
                    href={assignment.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Submitted Project
                  </a>
                </p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
