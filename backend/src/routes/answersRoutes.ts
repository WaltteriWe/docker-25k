import express from "express";
import {
  fetchAnswers,
  submitAnswers,
  clearAnswers,
  fetchFormChoices,
  fetchQuestions,
  saveUserAnswers,
} from "../controller/answersController";
import { authenticate } from "../middleware/authenticate";
import pool from "../database/db"; // Add this import for the pool

const router = express.Router();

// User answers routes
router.get("/", authenticate, fetchAnswers);
router.post("/", authenticate, submitAnswers);
router.delete("/", authenticate, clearAnswers);

// Form choices route
router.get("/choices", authenticate, fetchFormChoices);

// Questions route
router.get("/questions", authenticate, fetchQuestions);

// User answers submission route
router.post("/user-answers", authenticate, saveUserAnswers);

// Add a GET endpoint to retrieve user answers:
router.get("/user-answers", authenticate, async (req, res) => {
  let conn;
  try {
    const userId = (req as any).user.id;
    conn = await pool.getConnection();

    // Get user's form answers
    const [answers] = await conn.query(
      `SELECT User_Answers.form_question_id as questionId, User_Answers.answer as answerText
       FROM User_Answers
       WHERE User_Answers.user_id = ?
       ORDER BY User_Answers.form_question_id`,
      [userId]
    );

    res.status(200).json(answers);
  } catch (error) {
    console.error("Error fetching user answers:", error);
    res.status(500).json({ error: "Failed to fetch user answers" });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
