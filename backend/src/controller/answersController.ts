import { Request, Response } from "express";
import {
  getUserAnswers,
  saveAllAnswers,
  deleteUserAnswers,
} from "../model/answersModel";
import pool from "../database/db";

// GET all answers
export const fetchAnswers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const answers = await getUserAnswers(userId);
    res.status(200).json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST save all answers
export const submitAnswers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const answers = req.body.answers;

    if (!Array.isArray(answers)) {
      res
        .status(400)
        .json({ error: "Invalid format - answers must be an array" });
      return; // Return void, not the response object
    }

    if (answers.length === 0) {
      res.status(400).json({ error: "Answers are required" });
    }

    await saveAllAnswers(userId, answers);
    res.status(200).json({ message: "Answers saved successfully" });
  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE all answers
export const clearAnswers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await deleteUserAnswers(userId);
    res.status(200).json({ message: "Answers cleared" });
  } catch (error) {
    console.error("Error clearing answers:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET all possible answer choices (not user answers)
export const fetchFormChoices = async (
  req: Request,
  res: Response
): Promise<void> => {
  let conn;
  try {
    console.log("Fetching all possible answer choices");
    conn = await pool.getConnection();

    // Simpler query with LIMIT to ensure it returns
    const result = await conn.query("SELECT * FROM Form_Choices LIMIT 100");

    // Handle missing data safely
    if (!result || !result[0]) {
      console.log("No choices found in database");
      res.status(200).json([]);
      return; // Return void, not the response
    }

    const choices = result[0];
    console.log(`Found ${Array.isArray(choices) ? choices.length : 0} choices`);

    res.status(200).json(Array.isArray(choices) ? choices : [choices]);
    return; // Explicit void return
  } catch (error) {
    console.error("Error fetching form choices:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    // IMPORTANT: Always release connection even if there's an error
    if (conn) conn.release();
  }
};

// GET all questions
export const fetchQuestions = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all questions");
    const conn = await pool.getConnection();

    // Use direct query
    const result = await conn.query(
      "SELECT * FROM FormsQuestions ORDER BY category, id"
    );

    // Get rows from first element, don't destructure
    const rows = result[0];

    console.log(`Found ${rows.length} questions`);

    conn.release();
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST save user answers
export const saveUserAnswers = async (
  req: Request,
  res: Response
): Promise<void> => {
  let conn;
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user.id;
    console.log("Saving answers for user ID:", userId);
    console.log("Request body:", JSON.stringify(req.body).substring(0, 200));

    const answers = req.body;
    if (!Array.isArray(answers)) {
      res
        .status(400)
        .json({ error: "Invalid format - answers must be an array" });
      return; // Return void, not the response object
    }

    conn = await pool.getConnection();

    // Delete existing answers first
    await conn.query("DELETE FROM User_Answers WHERE user_id = ?", [userId]);
    console.log("Deleted existing answers");

    // Insert each answer
    for (const answer of answers) {
      const { questionId, answerText } = answer;
      console.log(
        `Saving answer: Question ${questionId}, Answer: ${answerText}`
      );

      // FIXED to match your actual database schema
      await conn.query(
        "INSERT INTO User_Answers (user_id, form_question_id, answer) VALUES (?, ?, ?)",
        [userId, questionId, answerText]
      );
    }

    console.log("All answers saved successfully");
    res.status(201).json({ message: "Answers saved successfully" });
  } catch (error) {
    console.error("Error saving user answers:", error);
    res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (conn) conn.release();
  }
};
