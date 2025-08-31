import pool from "../database/db";

// Get all BMI records
export const getAllBMI = async (userId: number) => {
  const conn = await pool.getConnection();
  const rows = await conn.query(
    "SELECT * FROM BMI WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  conn.release();
  return rows;
};

// Get latest BMI
export const getLatestBMI = async (userId: number) => {
  const conn = await pool.getConnection();
  const rows = await conn.query(
    "SELECT * FROM BMI WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  conn.release();
  return rows[0];
};

// Create new BMI record (weight + height only)
export const createBMIRecord = async (
  userId: number,
  weight: number,
  height: number
) => {
  const conn = await pool.getConnection();
  await conn.query(
    "INSERT INTO BMI (user_id, weight, height) VALUES (?, ?, ?)",
    [userId, weight, height]
  );
  conn.release();
};

// Delete specific BMI entry
export const deleteBMI = async (bmiId: number, userId: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM BMI WHERE id = ? AND user_id = ?", [bmiId, userId]);
  conn.release();
};
