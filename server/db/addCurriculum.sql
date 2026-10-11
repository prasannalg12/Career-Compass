
-- CareerCompass V2: Curriculum structure
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    position INT NOT NULL,
    estimated_hours INT NOT NULL DEFAULT 2,
    UNIQUE(skill_id, position)
);

CREATE TABLE IF NOT EXISTS subtopics (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INT NOT NULL,
    UNIQUE(topic_id, position)
);

CREATE TABLE IF NOT EXISTS topic_resources (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'article',
    UNIQUE(topic_id, url)
);

CREATE TABLE IF NOT EXISTS topic_progress (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    studied BOOLEAN NOT NULL DEFAULT FALSE,
    practiced BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topics_skill
ON topics(skill_id);

CREATE INDEX IF NOT EXISTS idx_subtopics_topic
ON subtopics(topic_id);
