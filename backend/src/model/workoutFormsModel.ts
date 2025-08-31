import pool from "../database/db";

// Get all workout forms
export const getAllWorkoutForms = async () => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query("SELECT * FROM WorkoutForms ORDER BY Id DESC");
  conn.release();
  return rows;
};

// Create a new workout form
export const createWorkoutForm = async (data: any) => {
  const conn = await pool.getConnection();
  const result = await conn.query(
    `INSERT INTO WorkoutForms (
      category, workout_program, exercise_name, times_performed,
      weight_kg, sets, description, duration_minutes, difficulty,
      video, photo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.category,
      data.workout_program,
      data.exercise_name,
      data.times_performed,
      data.weight_kg,
      data.sets,
      data.description,
      data.duration_minutes,
      data.difficulty,
      data.video,
      data.photo,
    ]
  );
  conn.release();
  return result.insertId;
};

// Update workout form
export const updateWorkoutForm = async (id: number, data: any) => {
  const conn = await pool.getConnection();
  await conn.query(
    `UPDATE WorkoutForms SET 
      category = ?, workout_program = ?, exercise_name = ?, times_performed = ?, 
      weight_kg = ?, sets = ?, description = ?, duration_minutes = ?, 
      difficulty = ?, video = ?, photo = ?
     WHERE Id = ?`,
    [
      data.category,
      data.workout_program,
      data.exercise_name,
      data.times_performed,
      data.weight_kg,
      data.sets,
      data.description,
      data.duration_minutes,
      data.difficulty,
      data.video,
      data.photo,
      id,
    ]
  );
  conn.release();
};

// Delete workout form
export const deleteWorkoutForm = async (id: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM WorkoutForms WHERE Id = ?", [id]);
  conn.release();
};
