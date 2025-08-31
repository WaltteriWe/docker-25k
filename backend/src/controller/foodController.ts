import { Request, Response } from "express";
import {
  getFoodEntries,
  createFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
} from "../model/foodModel";
import axios from "axios";

// GET: all food logs
export const fetchFood = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const entries = await getFoodEntries(userId);
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching food:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST: create food log
export const addFood = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { meals_per_day, meal_time, meal_type, details } = req.body;

    await createFoodEntry(userId, meals_per_day, meal_time, meal_type, details);
    res.status(201).json({ message: "Meal added" });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT: update food
export const editFood = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const foodId = parseInt(req.params.id);
    const { meals_per_day, meal_time, meal_type, details } = req.body;

    await updateFoodEntry(foodId, userId, {
      meals_per_day,
      meal_time,
      meal_type,
      details,
    });

    res.status(200).json({ message: "Meal updated" });
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
export const removeFood = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const foodId = parseInt(req.params.id);
    await deleteFoodEntry(foodId, userId);
    res.status(200).json({ message: "Meal deleted" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const searchNutritionixFood = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    console.log("Searching for:", query);

    const response = await axios.post(
      "https://trackapi.nutritionix.com/v2/search/instant",
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "x-app-id": process.env.NUTRITIONIX_APP_ID,
          "x-app-key": process.env.NUTRITIONIX_API_KEY, // Make sure this is API_KEY not APP_KEY
        },
      }
    );

    console.log("API response status:", response.status);
    console.log("Has data:", !!response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error searching food:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getNutritionInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const foodName = req.params.foodId; // This is where you get the food name from URL

    console.log("Getting nutrition for:", foodName); // Add this log

    // Make sure both API credentials are available
    if (!process.env.NUTRITIONIX_APP_ID || !process.env.NUTRITIONIX_API_KEY) {
      console.error("Missing Nutritionix credentials");
      res.status(500).json({ error: "API configuration error" });
      return;
    }

    const response = await axios.post(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      { query: foodName },
      {
        headers: {
          "Content-Type": "application/json",
          "x-app-id": process.env.NUTRITIONIX_APP_ID,
          "x-app-key": process.env.NUTRITIONIX_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error getting nutrition info:", error);
    res.status(500).json({ error: "Failed to get nutrition information" });
  }
};
