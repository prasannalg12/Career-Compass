require('dotenv').config();
const db = require('../src/db');
const outline = require('./allSkillsOutline');

// Additive and repeatable: does not delete, truncate, or alter existing student data.
// Existing topic positions are never reassigned. Existing questions are never modified.
function clean(s) { return String(s).replace(/\s+/g,' ').trim(); }
function buildQuestionSet(skill, title, allTitles, index) {
  // Each topic gets 15 starter MCQs. The question types are intentionally labeled
  // 'draft' via their explanations; they test topic recognition, not full mastery.
  const distractors = allTitles.filter(x => x !== title);
  const result=[];
  for (let n=0;n<15;n++) {
    const offset=(index+n)%distractors.length;
    const wrong=[0,1,2].map(k=>distractors[(offset+k)%distractors.length]);
    const correctPosition=n%4;
    const opts=wrong.slice(); opts.splice(correctPosition,0,title);
    const prompts=[
      `In the ${skill} learning path, which topic should you study to focus on "${title}"?`,
      `A learner needs practice specifically in "${title}". Which curriculum topic is the best match?`,
      `Which of the following is the named topic covering "${title}" within ${skill}?`
    ];
    result.push({prompt:`[Starter ${n+1}] ${prompts[n%3]}`,options:opts,correctIndex:correctPosition,
      explanation:`Starter orientation question for ${title}. This question checks topic recognition only, not practical competence. Replace with instructor-reviewed conceptual and applied questions.`,difficulty:1});
  }
  return result;
}
async function main() {
 const client=await db.connect();
 let skills=0,topics=0,subtopics=0,questions=0,skipped=0;
 try {
  await client.query('BEGIN');
  const existingSkills=(await client.query('SELECT id,name FROM skills ORDER BY id')).rows;
  for(const skill of existingSkills){
    // Preserve the complete 18-topic Programming Fundamentals curriculum and its existing assessments.
    if(skill.name==='Programming Fundamentals & OOP') continue;
    const titles=outline[skill.name] || [
      `${skill.name} Foundations`, `${skill.name} Core Concepts`, `${skill.name} Tools and Workflows`,
      `${skill.name} Practical Application`, `${skill.name} Troubleshooting`, `${skill.name} Best Practices`,
      `${skill.name} Case Studies`, `${skill.name} Capstone Project`
    ];
    const rows=(await client.query('SELECT id,title,position FROM topics WHERE skill_id=$1 ORDER BY position',[skill.id])).rows;
    const byTitle=new Map(rows.map(r=>[r.title.toLowerCase(),r]));
    let nextPosition=rows.reduce((max,r)=>Math.max(max,r.position),0)+1;
    skills++;
    for(let i=0;i<titles.length;i++){
      const title=titles[i];
      let topic=byTitle.get(title.toLowerCase());
      if(!topic){
        const inserted=await client.query(
          `INSERT INTO topics(skill_id,title,description,position,estimated_hours)
           VALUES($1,$2,$3,$4,$5) RETURNING id,title,position`,
          [skill.id,title,`Learn ${title} as part of ${skill.name}. Includes a starter assessment requiring review.`,nextPosition++,3]);
        topic=inserted.rows[0];topics++;
      }
      const sections=[`Overview of ${title}`,`Key terminology in ${title}`,`Working examples of ${title}`,
        `Common mistakes in ${title}`,`Hands-on exercise: ${title}`,`Review and reflection: ${title}`];
      const existingSub=(await client.query('SELECT title,position FROM subtopics WHERE topic_id=$1',[topic.id])).rows;
      const existingSubTitles=new Set(existingSub.map(r=>r.title.toLowerCase()));
      let nextSub=existingSub.reduce((max,r)=>Math.max(max,r.position),0)+1;
      for(const section of sections){
        if(existingSubTitles.has(section.toLowerCase())) continue;
        await client.query('INSERT INTO subtopics(topic_id,title,position) VALUES($1,$2,$3)',[topic.id,section,nextSub++]);subtopics++;
      }
      const qs=buildQuestionSet(skill.name,title,titles,i);
      for(const q of qs){
        const found=await client.query('SELECT id FROM topic_questions WHERE topic_id=$1 AND prompt=$2 LIMIT 1',[topic.id,q.prompt]);
        if(found.rowCount){skipped++;continue;}
        await client.query(`INSERT INTO topic_questions(topic_id,question_type,prompt,options,correct_index,explanation,difficulty)
          VALUES($1,'mcq',$2,$3,$4,$5,$6)`,[topic.id,q.prompt,JSON.stringify(q.options),q.correctIndex,q.explanation,q.difficulty]);
        questions++;
      }
    }
  }
  await client.query('COMMIT');
  console.log(`SUCCESS: ${skills} skills processed; ${topics} new topics; ${subtopics} new subtopics; ${questions} new starter MCQs; ${skipped} existing MCQs skipped.`);
  console.log('Existing curriculum, questions, users, and progress were not deleted.');
  console.log('IMPORTANT: starter MCQs are orientation placeholders, NOT validated mastery assessments.');
 }catch(err){await client.query('ROLLBACK');console.error('No changes committed:',err);process.exitCode=1;}
 finally{client.release();await db.end();}
}
main();
