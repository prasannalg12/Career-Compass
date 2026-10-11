import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function TopicResources({ topicId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setItems([]);
    api(`/curriculum/topics/${topicId}/resources`)
      .then((data) => { if (active) setItems(data); })
      .catch((err) => { if (active) setError(err.message || "Unable to load resources."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [topicId]);

  return (
    <section style={{ marginTop: 18 }} aria-label="External learning resources">
      <h4>Learning resources</h4>
      {loading && <p className="muted">Loading resources...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="muted">No reviewed resource links for this topic yet. We will add them as they are curated.</p>
      )}
      {items.length > 0 && (
        <ul style={{ lineHeight: 1.9 }}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>{" "}<span className="muted">({item.type})</span>
            </li>
          ))}
        </ul>
      )}
      <p className="muted" style={{ fontSize: 12 }}>
        Links open external learning sites. CareerCompass does not host their courses.
      </p>
    </section>
  );
}
