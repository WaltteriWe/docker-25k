import pool from "../database/db";

// Get choices for a question
export const getChoicesByQuestionId = async (questionId: number) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query(
    "SELECT * FROM Form_Choices WHERE question_id = ? ORDER BY id ASC",
    [questionId]
  );
  conn.release();
  return rows;
};

// Add one choice
export const addChoice = async (questionId: number, answerText: string) => {
  const conn = await pool.getConnection();
  const result = await conn.query(
    "INSERT INTO Form_Choices (question_id, answer_text) VALUES (?, ?)",
    [questionId, answerText]
  );
  conn.release();
  return result.insertId;
};

// Delete one choice
export const deleteChoice = async (id: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM Form_Choices WHERE id = ?", [id]);
  conn.release();
};
