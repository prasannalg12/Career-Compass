// Returns Map(skillId -> level) for a user. `q` is a pool or client.
async function getUserLevels(q, userId) {
  const { rows } = await q.query("SELECT skill_id, level FROM user_skills WHERE user_id=$1", [userId]);
  return new Map(rows.map((r) => [r.skill_id, r.level]));
}

module.exports = { getUserLevels };
