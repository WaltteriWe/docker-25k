import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getAllUsers,
  createUser,
  getUserByEmail,
  updateUserPassword,
  getUserById,
  getUserByName,
  updateUser,
  deleteUser,
} from "../model/usermodel";
import { sendEmail } from "../utils/emailService";
import dotenv from "dotenv";
import pool from "../database/db";

dotenv.config();

const SALT_ROUNDS = 10;
if (!process.env.JWT_SECRET) {
  throw new Error("SECRET_KEY is not set");
}
const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req: Request, res: Response) => {
  try {
    console.log("Signup request received:", req.body); // Log the incoming request body

    const { name, email, password, confirm_password, user_level } = req.body;

    if (!name || !email || !password || !confirm_password) {
      console.log("Validation failed: Missing fields");
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirm_password) {
      console.log("Validation failed: Passwords do not match");
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const validUserLevels = ["admin", "restaurant_owner", "customer"];
    const level = validUserLevels.includes(user_level)
      ? user_level
      : "customer";
    console.log("Resolved user level:", level);

    console.log("Checking if user exists with email:", email);
    const existingUser = await getUserByEmail(email);
    console.log("Existing user check result:", existingUser);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    console.log("Checking if user exists with name:", name);
    const existingUserByName = await getUserByName(name);
    console.log("Existing user by name:", existingUserByName);
    if (existingUserByName) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("Hashed password generated");

    console.log("Creating user with data:", {
      name,
      email,
      password: hashedPassword,
      user_level: level,
    });
    await createUser({
      name,
      email,
      password: hashedPassword,
      user_level: level,
    });

    console.log("User created successfully");
    res.status(201).json({ message: "User account created successfully" });
  } catch (error) {
    console.error("ERROR IN SIGNUP:", error);
    console.error("Stack trace:", (error as Error).stack);
    res.status(500).json({
      error: "Something went wrong",
      details: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { nameEmail, password } = req.body;

    if (!nameEmail || !password) {
      return res
        .status(400)
        .json({ error: "Email/username and password are required" });
    }

    const user = await getUserByNameOrEmail(nameEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.Id, // Make sure this is correct case
        username: user.Username,
        email: user.Email,
        user_level: user.User_level,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Check if this is user's first login
    const isFirstLogin = user.first_login === 1; // Or however you track first login

    // Update last_login_date
    const conn = await pool.getConnection();
    await conn.query(
      "UPDATE users SET last_login_date = CURRENT_TIMESTAMP WHERE Id = ?",
      [user.Id]
    );
    conn.release();

    res.status(200).json({
      message: "Login successful",
      token,
      isFirstLogin, // This needs to be included!
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        user_level: user.User_level,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserByNameOrEmail = async (nameOrEmail: string) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "SELECT * FROM users WHERE Username = ? OR Email = ?",
      [nameOrEmail, nameOrEmail]
    );
    conn.release();
    return result[0];
  } catch (error) {
    console.error("Error in getUserByNameOrEmail:", error);
    throw error;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    const resetToken = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      "Password Reset Request",
      `Hi ${user.name},\n\nYou requested to reset your password. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`
    );
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
    await updateUserPassword(decoded.email, hashedPassword);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      user_level: user.user_level,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { username, email } = req.body;

    await updateUser(userId, { username, email });
    res.status(200).json({ message: "User information updated successfully" });
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ error: "Failed to update user information" });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await deleteUser(userId);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ error: "Failed to delete user account" });
  }
};

// Save user's responses to onboarding questions
export const saveOnboardingResponses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      res.status(400).json({ error: "Invalid response format" });
      return;
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      for (const response of responses) {
        await conn.query(
          "INSERT INTO UserResponses (user_id, question_id, answer) VALUES (?, ?, ?)",
          [userId, response.questionId, response.answer]
        );
      }

      await conn.query(
        "UPDATE users SET onboarding_complete = TRUE WHERE Id = ?",
        [userId]
      );

      await conn.commit();
      res.status(200).json({ message: "Onboarding completed successfully" });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error saving onboarding responses:", error);
    res.status(500).json({ error: "Failed to save responses" });
  }
};

// Check if user has completed onboarding
export const getOnboardingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const conn = await pool.getConnection();
    const [result] = await conn.query(
      "SELECT onboarding_complete FROM users WHERE Id = ?",
      [userId]
    );
    conn.release();

    const onboardingComplete = result[0]?.onboarding_complete === 1;

    res.status(200).json({ onboardingComplete });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    res.status(500).json({ error: "Failed to check onboarding status" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  let conn;
  try {
    const userId = (req as any).user.id;
    console.log("Updating profile for user:", userId);

    // Get profile data from request body
    const { gender, age, height, weight, fitnessLevel, fitnessGoal } = req.body;

    conn = await pool.getConnection();

    // Check if user profile exists
    const [userCheck] = await conn.query(
      "SELECT * FROM UserProfiles WHERE user_id = ?",
      [userId]
    );

    if (userCheck && userCheck.length > 0) {
      // Update existing profile
      await conn.query(
        `UPDATE UserProfiles 
         SET gender = ?, age = ?, height = ?, weight = ?, 
             fitness_level = ?, fitness_goal = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [gender, age, height, weight, fitnessLevel, fitnessGoal, userId]
      );
    } else {
      // Create new profile
      await conn.query(
        `INSERT INTO UserProfiles 
         (user_id, gender, age, height, weight, fitness_level, fitness_goal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, gender, age, height, weight, fitnessLevel, fitnessGoal]
      );
    }

    // Also update onboarded status in Users table
    await conn.query(
      "UPDATE Users SET onboarded = TRUE, updated_at = NOW() WHERE id = ?",
      [userId]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};
