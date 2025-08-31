import express from "express";
import cors from "cors";
import userroute from "./routes/userroute";
import { ErrorRequestHandler } from "express";
import formsQuestionRoutes from "./routes/formsQuestionsRoutes";
import answersRoutes from "./routes/answersRoutes";
import userProfileRoutes from "./routes/profileRoutes";
import workoutFormRoutes from "./routes/workoutFormsRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import foodRoutes from "./routes/foodRoutes";
import bmiRoutes from "./routes/bmiRoutes";
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/user", userroute);
app.use("/api/forms-questions", formsQuestionRoutes);
app.use("/api/forms-answers", answersRoutes);
app.use("/api/user-profiles", userProfileRoutes);
app.use("/api/workout-forms", workoutFormRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/bmi", bmiRoutes);
// Add a global error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Something went wrong",
    details: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
};

app.use(errorHandler);

// Add a test endpoint to verify basic functionality

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(
    `Server running on port ${port} and accessible from all interfaces`
  );
});

export default app;
