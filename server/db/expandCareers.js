
require('dotenv').config();

const db = require('../src/db');

const newCareers = [
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    field: 'Technology',
    description: 'Builds interactive, accessible and responsive website interfaces.',
    reqs: [
      ['HTML & CSS', 4, 3], ['JavaScript', 4, 3],
      ['TypeScript', 3, 2], ['React', 4, 3],
      ['Git', 3, 2], ['REST API Design', 2, 2],
      ['Testing & Debugging', 3, 2], ['UX Research', 2, 1],
      ['Communication', 3, 1]
    ]
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    field: 'Technology',
    description: 'Builds server applications, APIs, databases and backend services.',
    reqs: [
      ['Programming Fundamentals & OOP', 4, 3],
      ['Data Structures & Algorithms', 3, 2],
      ['Node.js & Backend', 4, 3],
      ['REST API Design', 4, 3],
      ['SQL', 4, 3], ['Database Design & NoSQL', 4, 3],
      ['Security Basics', 4, 3], ['System Design', 3, 2],
      ['Git', 3, 2], ['Testing & Debugging', 4, 2]
    ]
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    field: 'Technology',
    description: 'Develops both frontend interfaces and backend applications.',
    reqs: [
      ['HTML & CSS', 4, 3], ['JavaScript', 4, 3],
      ['React', 4, 3], ['Node.js & Backend', 4, 3],
      ['REST API Design', 4, 3], ['SQL', 3, 2],
      ['Database Design & NoSQL', 3, 2],
      ['Git', 4, 2], ['Security Basics', 3, 2],
      ['Testing & Debugging', 3, 2]
    ]
  },
  {
    slug: 'mobile-app-developer',
    title: 'Mobile App Developer',
    field: 'Technology',
    description: 'Creates applications for Android and iOS devices.',
    reqs: [
      ['Programming Fundamentals & OOP', 4, 3],
      ['Data Structures & Algorithms', 3, 2],
      ['JavaScript', 3, 2], ['React Native', 4, 3],
      ['Mobile App Development', 4, 3],
      ['REST API Design', 3, 2], ['Git', 3, 2],
      ['Testing & Debugging', 3, 2]
    ]
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    field: 'Data',
    description: 'Uses statistics, programming and machine learning to solve data problems.',
    reqs: [
      ['Python', 4, 3], ['Statistics', 5, 3],
      ['SQL', 4, 3], ['Data Cleaning & Wrangling', 4, 3],
      ['Data Visualization', 4, 2],
      ['Machine Learning Basics', 4, 3],
      ['Deep Learning', 3, 2],
      ['A/B Testing & Experimentation', 4, 2],
      ['Communication', 3, 2]
    ]
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    field: 'Data',
    description: 'Develops and deploys machine learning models in production.',
    reqs: [
      ['Python', 5, 3], ['Statistics', 4, 3],
      ['Machine Learning Basics', 5, 3],
      ['Deep Learning', 4, 3],
      ['Data Cleaning & Wrangling', 4, 2],
      ['MLOps', 4, 3], ['Docker & Containers', 3, 2],
      ['Cloud Basics', 3, 2],
      ['Data Structures & Algorithms', 3, 2]
    ]
  },
  {
    slug: 'ai-engineer',
    title: 'AI Engineer',
    field: 'Data',
    description: 'Builds AI-powered applications and intelligent systems.',
    reqs: [
      ['Python', 4, 3], ['Machine Learning Basics', 4, 3],
      ['Deep Learning', 4, 3],
      ['Generative AI & LLMs', 4, 3],
      ['REST API Design', 3, 2],
      ['MLOps', 3, 2], ['Cloud Basics', 3, 2],
      ['Data Privacy & Ethics', 3, 2]
    ]
  },
  {
    slug: 'data-engineer',
    title: 'Data Engineer',
    field: 'Data',
    description: 'Builds and maintains reliable data processing systems.',
    reqs: [
      ['Python', 4, 3], ['SQL', 5, 3],
      ['ETL & Data Pipelines', 5, 3],
      ['Data Modeling & Warehousing', 4, 3],
      ['Cloud Basics', 4, 2],
      ['Linux & Command Line', 3, 2],
      ['Data Cleaning & Wrangling', 3, 2],
      ['Docker & Containers', 3, 2]
    ]
  },
  {
    slug: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    field: 'Technology',
    description: 'Monitors, investigates and helps prevent cybersecurity threats.',
    reqs: [
      ['Security Basics', 5, 3],
      ['Computer Networks', 4, 3],
      ['Operating Systems', 4, 3],
      ['Linux & Command Line', 4, 3],
      ['Cybersecurity Operations', 4, 3],
      ['Python', 3, 2],
      ['Cloud Basics', 3, 2],
      ['Communication', 3, 2]
    ]
  },
  {
    slug: 'cloud-engineer',
    title: 'Cloud Engineer',
    field: 'Technology',
    description: 'Designs, manages and automates cloud infrastructure.',
    reqs: [
      ['Cloud Basics', 5, 3],
      ['Linux & Command Line', 4, 3],
      ['Computer Networks', 4, 3],
      ['Docker & Containers', 4, 3],
      ['CI/CD', 4, 2],
      ['Infrastructure as Code', 4, 3],
      ['Security Basics', 3, 2],
      ['Python', 3, 2]
    ]
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    field: 'Technology',
    description: 'Automates development, deployment and infrastructure operations.',
    reqs: [
      ['Linux & Command Line', 5, 3],
      ['Git', 4, 3], ['CI/CD', 5, 3],
      ['Docker & Containers', 5, 3],
      ['Cloud Basics', 4, 3],
      ['Infrastructure as Code', 4, 3],
      ['Python', 3, 2],
      ['Computer Networks', 3, 2]
    ]
  },
  {
    slug: 'qa-automation-engineer',
    title: 'QA Automation Engineer',
    field: 'Technology',
    description: 'Builds automated tests to improve software reliability.',
    reqs: [
      ['Testing & Debugging', 5, 3],
      ['Programming Fundamentals & OOP', 3, 2],
      ['JavaScript', 3, 2],
      ['Test Automation', 5, 3],
      ['REST API Design', 3, 2],
      ['Git', 3, 2], ['CI/CD', 3, 2]
    ]
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    field: 'Business',
    description: 'Defines product direction and coordinates teams to deliver customer value.',
    reqs: [
      ['Product Management', 5, 3],
      ['UX Research', 3, 2],
      ['Business Acumen', 4, 3],
      ['Communication', 5, 3],
      ['Agile & Teamwork', 4, 3],
      ['Data Visualization', 2, 1],
      ['Critical Thinking', 4, 3]
    ]
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    field: 'Business',
    description: 'Analyzes business processes and translates requirements into solutions.',
    reqs: [
      ['Business Analysis', 5, 3],
      ['Business Acumen', 4, 3],
      ['Communication', 4, 3],
      ['SQL', 3, 2],
      ['Excel & Spreadsheets', 4, 3],
      ['Critical Thinking', 4, 3],
      ['Agile & Teamwork', 3, 2]
    ]
  },
  {
    slug: 'digital-marketing-specialist',
    title: 'Digital Marketing Specialist',
    field: 'Business',
    description: 'Plans and measures online marketing campaigns.',
    reqs: [
      ['Digital Marketing', 5, 3],
      ['SEO & Analytics', 4, 3],
      ['Communication', 4, 2],
      ['Data Visualization', 3, 2],
      ['Excel & Spreadsheets', 3, 2],
      ['Business Acumen', 3, 2]
    ]
  },
  {
    slug: 'financial-analyst',
    title: 'Financial Analyst',
    field: 'Business',
    description: 'Evaluates financial information to support business decisions.',
    reqs: [
      ['Financial Analysis', 5, 3],
      ['Excel & Spreadsheets', 5, 3],
      ['Statistics', 3, 2],
      ['Business Acumen', 4, 3],
      ['Data Visualization', 3, 2],
      ['Critical Thinking', 4, 2],
      ['Communication', 3, 2]
    ]
  }
];

const categoryFor = (name, field) => {
  if ([
    'React Native', 'Mobile App Development',
    'Cybersecurity Operations', 'Infrastructure as Code',
    'Test Automation'
  ].includes(name)) return 'Technology';

  if ([
    'Deep Learning', 'MLOps', 'Generative AI & LLMs'
  ].includes(name)) return 'Data';

  return field;
};

async function main() {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    for (const career of newCareers) {
      const result = await client.query(
        `INSERT INTO careers
           (slug, title, field, description, education_path)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug)
         DO UPDATE SET
           title = EXCLUDED.title,
           field = EXCLUDED.field,
           description = EXCLUDED.description
         RETURNING id`,
        [
          career.slug,
          career.title,
          career.field,
          career.description,
          'Relevant education, practical skills and portfolio projects.'
        ]
      );

      const careerId = result.rows[0].id;

      for (const [skillName, level, importance] of career.reqs) {
        const skillResult = await client.query(
          `INSERT INTO skills (name, category)
           VALUES ($1, $2)
           ON CONFLICT (name)
           DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [skillName, categoryFor(skillName, career.field)]
        );

        const skillId = skillResult.rows[0].id;

        await client.query(
          `INSERT INTO career_skills
             (career_id, skill_id, required_level, importance)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (career_id, skill_id)
           DO UPDATE SET
             required_level = EXCLUDED.required_level,
             importance = EXCLUDED.importance`,
          [careerId, skillId, level, importance]
        );
      }

      console.log('Added/updated:', career.title);
    }

    await client.query('COMMIT');
    console.log('Career expansion completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Career expansion failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

main();
