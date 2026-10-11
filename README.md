# CareerCompass

Adaptive career guidance: pick a career, see your skill gaps, follow a roadmap that changes after each skill check.

## What you need
- Node.js 20 or newer
- PostgreSQL 14 or newer

## 1. Create the database
```bash
createdb careercompass
```

## 2. Start the API
```bash
cd server
cp .env.example .env        # then edit DATABASE_URL and set a long random JWT_SECRET
npm install
npm run migrate             # creates tables (drops existing ones, dev only)
npm run seed                # loads 3 careers, 10 skills, resources and questions
npm test                    # engine unit tests, no database needed
npm run dev                 # http://localhost:4000
```

## 3. Start the web app
```bash
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to port 4000)
```

## Try the full flow
1. Create an account, then set weekly hours and interests on **Profile**.
2. Rate yourself on **My skills** and save.
3. Open **Careers**, check the match scores, and choose **Build my roadmap**.
4. On **Roadmap**, tick off tasks, then take a **Skill check**.
5. Score 80%+ to level up and skip known material, 50-79% to get a practice task, under 50% to get an easier review resource. Each change is explained under "Why your plan changed".

## Where things live
| Path | Purpose |
|---|---|
| `server/db/schema.sql` | All tables |
| `server/db/seed.js` | Careers, skill requirements, resources, quiz questions |
| `server/src/services/` | Pure logic: `matching`, `gapAnalysis`, `roadmapEngine`, `adaptation` |
| `server/src/routes/` | REST API |
| `client/src/pages/` | Screens |

## Next steps
- Add more questions per skill and level (each skill has only 2 right now) and more careers.
- Replace the seed resource links with courses you have reviewed.
- Add tests that run the routes against a test database.
- Add email verification and password reset before real users.
- Optional: use an AI model only to explain recommendations, never to decide them.

## API summary
`POST /api/auth/register|login` · `GET|PUT /api/auth/me` · `GET /api/careers` · `GET /api/careers/recommendations` · `GET /api/careers/:id` · `GET /api/skills` · `GET|PUT /api/skills/mine` · `POST /api/roadmaps` · `GET /api/roadmaps/current` · `PATCH /api/roadmaps/tasks/:id` · `POST /api/roadmaps/current/rebalance` · `GET|POST /api/assessments/:skillId`
