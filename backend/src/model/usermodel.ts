import pool from "../database/db";

export type User = {
  id?: number;
  name: string;
  email: string;
  password: string;
  user_level: "admin" | "restaurant_owner" | "customer";
};

export const getAllUsers = async (): Promise<User[]> => {
  const conn = await pool.getConnection();
  const rows = await conn.query("SELECT * FROM users");
  conn.release();
  return rows;
};

export const createUser = async (user: {
  name: string;
  email: string;
  password: string;
  user_level: string;
}) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO users (Username, Email, Password, User_level) VALUES (?, ?, ?, ?)",
      [user.name, user.email, user.password, user.user_level]
    );
    conn.release();
    return result;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query("SELECT * FROM users WHERE Email = ?", [
      email,
    ]);
    conn.release();
    return result[0];
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    throw error;
  }
};

export const updateUserPassword = async (
  email: string,
  newPassword: string
): Promise<void> => {
  const conn = await pool.getConnection();
  await conn.query("UPDATE users SET password = ? WHERE email = ?", [
    newPassword,
    email,
  ]);
  conn.release();
};

export const getUserById = async (id: number) => {
  try {
    const conn = await pool.getConnection();
    // Make sure to use the correct column name - 'Id' with capital I
    const result = await conn.query("SELECT * FROM users WHERE Id = ?", [id]);
    conn.release();
    return result[0];
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
};

export const getUserByName = async (name: string) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query("SELECT * FROM users WHERE Username = ?", [
      name,
    ]);
    conn.release();
    return result[0];
  } catch (error) {
    console.error("Error in getUserByName:", error);
    throw error;
  }
};

export const updateUser = async (user_id: number, data: {username: string; email: string}) => {
  const conn = await pool.getConnection();
  await conn.query(
    "UPDATE users SET Username = ?, Email = ? WHERE Id = ?",
    [data.username, data.email, user_id]
  );
  conn.release();
}
export const deleteUser = async (user_id: number) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM users WHERE Id = ?", [user_id]);
  conn.release();
}