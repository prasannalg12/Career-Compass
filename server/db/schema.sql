
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  education TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  weekly_hours INT NOT NULL DEFAULT 5 CHECK (weekly_hours BETWEEN 1 AND 60),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS careers (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  field TEXT NOT NULL,
  description TEXT NOT NULL,
  education_path TEXT DEFAULT '',
  salary_range TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS career_skills (
  career_id INT REFERENCES careers(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  required_level INT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
  importance INT NOT NULL DEFAULT 1 CHECK (importance BETWEEN 1 AND 3),
  PRIMARY KEY (career_id, skill_id)
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level BETWEEN 0 AND 5),
  source TEXT NOT NULL DEFAULT 'self' CHECK (source IN ('self','assessed')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'course',
  level INT NOT NULL CHECK (level BETWEEN 1 AND 5),
  est_hours INT NOT NULL DEFAULT 3
);

CREATE TABLE IF NOT EXISTS roadmaps (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  career_id INT REFERENCES careers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','complete')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  roadmap_id INT REFERENCES roadmaps(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  target_level INT NOT NULL,
  position INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','done'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  milestone_id INT REFERENCES milestones(id) ON DELETE CASCADE,
  resource_id INT REFERENCES resources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  est_hours INT NOT NULL DEFAULT 1,
  due_week INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','done','skipped'))
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 5),
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  score NUMERIC(4,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Record automatic roadmap changes so the UI can explain them.
CREATE TABLE IF NOT EXISTS roadmap_changes (
  id SERIAL PRIMARY KEY,
  roadmap_id INT REFERENCES roadmaps(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone
  ON tasks(milestone_id);

CREATE INDEX IF NOT EXISTS idx_milestones_roadmap
  ON milestones(roadmap_id);

CREATE INDEX IF NOT EXISTS idx_user_skills_user
  ON user_skills(user_id);
