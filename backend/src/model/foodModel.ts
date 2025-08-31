import pool from "../database/db";

// Get all food entries for user
export const getFoodEntries = async (userId: number) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query("SELECT * FROM Food WHERE user_id = ?", [userId]);
  conn.release();
  return rows;
};

// Create food entry
export const createFoodEntry = async (
  userId: number,
  meals_per_day: number,
  meal_time: string,
  meal_type: string,
  details: string
) => {
  const conn = await pool.getConnection();
  await conn.query(
    `INSERT INTO Food (user_id, meals_per_day, meal_time, meal_type, details)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, meals_per_day, meal_time, meal_type, details]
  );
  conn.release();
};

// Update food entry
export const updateFoodEntry = async (
  foodId: number,
  userId: number,
  data: {
    meals_per_day: number;
    meal_time: string;
    meal_type: string;
    details: string;
  }
) => {
  const conn = await pool.getConnection();
  await conn.query(
    `UPDATE Food SET meals_per_day = ?, meal_time = ?, meal_type = ?, details = ?
     WHERE id = ? AND user_id = ?`,
    [
      data.meals_per_day,
      data.meal_time,
      data.meal_type,
      data.details,
      foodId,
      userId,
    ]
  );
  conn.release();
};

// Delete food entry
export const deleteFoodEntry = async (foodId: number, userId: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM Food WHERE id = ? AND user_id = ?", [foodId, userId]);
  conn.release();
};
