import pool from "../database/db";

// Get all answers for a user
export const getUserAnswers = async (userId: number) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query(
    `SELECT a.*, q.question 
     FROM User_Answers a
     JOIN FormsQuestions q ON a.form_question_id = q.id
     WHERE a.user_id = ? ORDER BY a.created_at`,
    [userId]
  );
  conn.release();
  return rows;
};

// Save one answer
export const saveUserAnswer = async (
  userId: number,
  formQuestionId: number,
  answer: string
) => {
  const conn = await pool.getConnection();
  await conn.query(
    "INSERT INTO User_Answers (user_id, form_question_id, answer) VALUES (?, ?, ?)",
    [userId, formQuestionId, answer]
  );
  conn.release();
};

// Save multiple answers
export const saveAllAnswers = async (
  userId: number,
  answers: { form_question_id: number; answer: string }[]
) => {
  for (const item of answers) {
    await saveUserAnswer(userId, item.form_question_id, item.answer);
  }
};

// Delete all answers for a user
export const deleteUserAnswers = async (userId: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM User_Answers WHERE user_id = ?", [userId]);
  conn.release();
};
