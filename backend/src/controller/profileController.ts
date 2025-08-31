import { Request, Response } from "express";
import {
  getProfileByUserId,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../model/profileModel";

// GET
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getProfileByUserId(userId);
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST
export const createUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { gender, age, height, weight, workout_days, calorie_target } = req.body;
    await createProfile(userId, gender, age, height, weight, workout_days, calorie_target);
    res.status(201).json({ message: "Profile created" });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { gender, age, height, weight, workout_days, calorie_target } = req.body;
    await updateProfile(userId, {
      gender,
      age,
      height,
      weight,
      workout_days,
      calorie_target,
    });
    res.status(200).json({ message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await deleteProfile(userId);
    res.status(200).json({ message: "Profile deleted" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};
