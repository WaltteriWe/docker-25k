import { Request, Response } from "express";
import {
  getWorkouts,
  assignWorkouts,
  markWorkoutDone,
  deleteWorkout
} from "../model/workoutModel";

// GET workouts (with optional filter)
export const fetchWorkouts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const isDone = req.query.is_done as string;
    const workouts = await getWorkouts(userId, isDone);
    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST assign workouts (from frontend)
export const assignUserWorkouts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { workoutFormIds } = req.body;

    if (!Array.isArray(workoutFormIds) || workoutFormIds.length === 0) {
       res.status(400).json({ error: "No workoutFormIds provided" });
    }

    await assignWorkouts(userId, workoutFormIds);
    res.status(201).json({ message: "Workouts assigned" });
  } catch (error) {
    console.error("Error assigning workouts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT: mark as done
export const completeWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const workoutId = parseInt(req.params.id);
    await markWorkoutDone(userId, workoutId);
    res.status(200).json({ message: "Workout marked as done" });
  } catch (error) {
    console.error("Error completing workout:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE: delete workout
export const removeWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const workoutId = parseInt(req.params.id);
    await deleteWorkout(userId, workoutId);
    res.status(200).json({ message: "Workout deleted" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ error: "Server error" });
  }
};
