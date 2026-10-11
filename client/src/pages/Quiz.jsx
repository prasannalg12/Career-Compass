import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Quiz({ skillId, skillName, onClose, onDone }) {
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/assessments/' + skillId).then(setQuestions).catch((e) => setError(e.message)); }, [skillId]);

  async function submit() {
    try {
      const answers = questions.map((q) => ({ questionId: q.id, choice: choices[q.id] ?? -1 }));
      setResult(await api('/assessments/' + skillId, { method: 'POST', body: { answers } }));
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="panel quiz">
      <h3>Skill check: {skillName}</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {!result && questions.map((q, i) => (
        <fieldset key={q.id}>
          <legend>{i + 1}. {q.prompt}</legend>
          {q.options.map((o, idx) => (
            <label key={idx} className="check">
              <input type="radio" name={'q' + q.id} checked={choices[q.id] === idx}
                onChange={() => setChoices({ ...choices, [q.id]: idx })} /> {o}
            </label>
          ))}
        </fieldset>
      ))}
      {!result && questions.length > 0 && <button className="primary" onClick={submit}>Submit answers</button>}
      {!result && questions.length === 0 && !error && <p className="muted">No questions are available for this skill yet.</p>}
      {result && (
        <div role="status">
          <p><strong>{result.correct} of {result.total} correct ({result.score}%)</strong></p>
          <p>{result.reason}</p>
          <button className="primary" onClick={onDone}>Back to roadmap</button>
        </div>
      )}
      {!result && <button className="link" onClick={onClose}>Cancel</button>}
    </div>
  );
}
