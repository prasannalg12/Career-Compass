
CREATE TABLE IF NOT EXISTS topic_assignments (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL
        REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL
        REFERENCES topic_assignments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    submission_url TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'submitted')),
    submitted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (assignment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_assignments_topic
ON topic_assignments(topic_id);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user
ON assignment_submissions(user_id);
