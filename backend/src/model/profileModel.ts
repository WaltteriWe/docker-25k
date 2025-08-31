import pool from "../database/db";

export const getProfileByUserId = async (userId: number) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query("SELECT * FROM User_Profiles WHERE user_id = ?", [userId]);
  conn.release();
  return rows[0];
};

export const createProfile = async (
  userId: number,
  gender: string,
  age: number,
  height: number,
  weight: number,
  workout_days: number,
  calorie_target: number
) => {
  const conn = await pool.getConnection();
  await conn.query(
    `INSERT INTO User_Profiles (user_id, gender, age, height, weight, workout_days, calorie_target)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, gender, age, height, weight, workout_days, calorie_target]
  );
  conn.release();
};

export const updateProfile = async (
  userId: number,
  data: {
    gender: string;
    age: number;
    height: number;
    weight: number;
    workout_days: number;
    calorie_target: number;
  }
) => {
  const conn = await pool.getConnection();
  await conn.query(
    `UPDATE User_Profiles 
     SET gender = ?, age = ?, height = ?, weight = ?, workout_days = ?, calorie_target = ?
     WHERE user_id = ?`,
    [
      data.gender,
      data.age,
      data.height,
      data.weight,
      data.workout_days,
      data.calorie_target,
      userId,
    ]
  );
  conn.release();
};

export const deleteProfile = async (userId: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM User_Profiles WHERE user_id = ?", [userId]);
  conn.release();
};
