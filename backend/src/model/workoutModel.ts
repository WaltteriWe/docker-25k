import pool from "../database/db";

// Get workouts for a user (optional filter by is_done)
export const getWorkouts = async (userId: number, isDone?: string) => {
  const conn = await pool.getConnection();
  let query = "SELECT * FROM Workouts WHERE user_id = ?";
  const params: any[] = [userId];

  if (isDone) {
    query += " AND is_done = ?";
    params.push(isDone);
  }

  const [rows] = await conn.query(query, params);
  conn.release();
  return rows;
};

// Create workouts for a user from selected WorkoutForms
export const assignWorkouts = async (userId: number, workoutFormIds: number[]) => {
  const conn = await pool.getConnection();

  for (const formId of workoutFormIds) {
    const [rows] = await conn.query("SELECT * FROM WorkoutForms WHERE Id = ?", [formId]);
    const wf = rows[0];
    if (wf) {
      await conn.query(
        `INSERT INTO Workouts (
          user_id, workout_form_id, workout_program, exercise_name,
          times_performed, weight_kg, sets, description,
          duration_minutes, difficulty, video, photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          wf.Id,
          wf.workout_program,
          wf.exercise_name,
          wf.times_performed,
          wf.weight_kg,
          wf.sets,
          wf.description,
          wf.duration_minutes,
          wf.difficulty,
          wf.video,
          wf.photo,
        ]
      );
    }
  }

  conn.release();
};

// Mark workout as done
export const markWorkoutDone = async (userId: number, workoutId: number) => {
  const conn = await pool.getConnection();
  await conn.query(
    `UPDATE Workouts SET is_done = 'yes', completion_time = NOW() WHERE Id = ? AND user_id = ?`,
    [workoutId, userId]
  );
  conn.release();
};

// Delete workout
export const deleteWorkout = async (userId: number, workoutId: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM Workouts WHERE Id = ? AND user_id = ?", [
    workoutId,
    userId,
  ]);
  conn.release();
};
