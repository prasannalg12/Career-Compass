
-- CareerCompass V2: Topic assessments
-- Non-destructive migration

CREATE TABLE IF NOT EXISTS topic_questions (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL DEFAULT 'mcq'
        CHECK (question_type IN ('mcq', 'short_answer', 'coding')),
    prompt TEXT NOT NULL,
    options JSONB,
    correct_index INT,
    explanation TEXT DEFAULT '',
    difficulty INT NOT NULL DEFAULT 1
        CHECK (difficulty BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS topic_assessment_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL
        CHECK (score BETWEEN 0 AND 100),
    total_questions INT NOT NULL
        CHECK (total_questions > 0),
    correct_answers INT NOT NULL
        CHECK (correct_answers >= 0
               AND correct_answers <= total_questions),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_questions_topic
ON topic_questions(topic_id);

CREATE INDEX IF NOT EXISTS idx_topic_attempts_user_topic
ON topic_assessment_attempts(user_id, topic_id);
