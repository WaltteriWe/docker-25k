import pool from "../database/db";

// Get all form questions
export const getAllFormQuestions = async () => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query("SELECT * FROM FormsQuestions ORDER BY id ASC");
  conn.release();
  return rows;
};

// Create new question
export const createFormQuestion = async (category: string, question: string) => {
  const conn = await pool.getConnection();
  const result = await conn.query(
    "INSERT INTO FormsQuestions (category, question) VALUES (?, ?)",
    [category, question]
  );
  conn.release();
  return result.insertId;
};

// Update question
export const updateFormQuestion = async (id: number, category: string, question: string) => {
  const conn = await pool.getConnection();
  await conn.query(
    "UPDATE FormsQuestions SET category = ?, question = ? WHERE id = ?",
    [category, question, id]
  );
  conn.release();
};

// Delete question
export const deleteFormQuestion = async (id: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM FormsQuestions WHERE id = ?", [id]);
  conn.release();
};
