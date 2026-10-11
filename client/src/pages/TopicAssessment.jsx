
import { useState } from "react";
import { api } from "../api.js";

export default function TopicAssessment({ topicId }) {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startAssessment() {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    setAssessment(null);

    try {
      const data = await api(
        `/curriculum/topics/${topicId}/questions`
      );
      setAssessment(data);
    } catch (err) {
      setError(err.message || "Unable to load assessment.");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId, optionIndex) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  }

  async function submitAssessment() {
    if (!assessment) return;

    const unanswered = assessment.questions.filter(
      (question) => answers[question.id] === undefined
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all ${assessment.totalQuestions} questions before submitting.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submittedAnswers = assessment.questions.map(
        (question) => answers[question.id]
      );

      const data = await api(
        `/curriculum/topics/${topicId}/submit`,
        {
          method: "POST",
          body: {
            assessmentId: assessment.assessmentId,
            answers: submittedAnswers,
          },
        }
      );

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to submit assessment.");
    } finally {
      setLoading(false);
    }
  }

  const answeredCount = assessment
    ? assessment.questions.filter(
        (question) => answers[question.id] !== undefined
      ).length
    : 0;

  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        border: "1px solid #d1d5db",
        borderRadius: 12,
      }}
    >
      <h4>Topic Assessment</h4>

      {!assessment && (
        <>
          <p className="muted">
            Test your understanding with topic-specific
            multiple-choice questions.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={startAssessment}
          >
            {loading ? "Loading..." : "Start Assessment"}
          </button>
        </>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {assessment && !result && (
        <>
          <p className="muted">
            Answered {answeredCount} of{" "}
            {assessment.totalQuestions} questions
          </p>

          <div style={{ display: "grid", gap: 20 }}>
            {assessment.questions.map((question, index) => (
              <div
                key={question.id}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <p>
                  <strong>
                    Question {index + 1}. {question.prompt}
                  </strong>
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={
                          answers[question.id] === optionIndex
                        }
                        onChange={() =>
                          selectAnswer(question.id, optionIndex)
                        }
                      />
                      {" "}{option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={submitAssessment}
            style={{ marginTop: 20 }}
          >
            {loading ? "Submitting..." : "Submit Assessment"}
          </button>
        </>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>
            Your Score: {result.score}%
          </h3>

          <p>
            {result.correctAnswers} correct out of{" "}
            {result.totalQuestions} questions
          </p>

          <p>
            <strong>
              {result.passed
                ? "Assessment Passed!"
                : "Keep practicing and try again."}
            </strong>
          </p>

          <h4>Answer Review</h4>

          {assessment.questions.map((question, index) => {
            const feedback = result.feedback.find(
              (item) => item.questionId === question.id
            );

            if (!feedback) return null;

            return (
              <div
                key={question.id}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <p>
                  <strong>
                    {index + 1}. {question.prompt}
                  </strong>
                </p>

                <p>
                  Your answer:{" "}
                  {question.options[feedback.selectedIndex] ??
                    "Not answered"}
                </p>

                <p>
                  Correct answer:{" "}
                  {question.options[feedback.correctIndex]}
                </p>

                <p>
                  {feedback.isCorrect
                    ? "Correct"
                    : "Incorrect"}
                </p>

                <p className="muted">
                  {feedback.explanation}
                </p>
              </div>
            );
          })}

          <button
            type="button"
            onClick={startAssessment}
            disabled={loading}
          >
            {loading ? "Loading..." : "Retake Assessment"}
          </button>
        </div>
      )}
    </div>
  );
}
