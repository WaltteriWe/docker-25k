import express, { Request, Response } from "express"; // Add Request and Response types
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  fetchUsers,
  updateUserInfo,
  deleteUserAccount,
  getOnboardingStatus,
  saveOnboardingResponses,
  updateUserProfile,
} from "../controller/usercontroller";
import { getUserById } from "../model/usermodel"; // Add this import

import { authenticate } from "../middleware/authenticate";

const router = express.Router();
// Korjattu: annetaan `next` kaikille kutsuille
router.post("/signup", async (req, res) => {
  await signup(req, res);
});
router.post("/login", async (req, res) => {
  await login(req, res);
});
router.post("/forgot-password", async (req, res) => {
  await forgotPassword(req, res);
});
router.post("/reset-password", async (req, res) => {
  await resetPassword(req, res);
});
router.get("/users", async (req, res) => {
  await fetchUsers(req, res);
});

// Define a separate controller function
const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log("Fetching profile for user ID:", userId);

    const user = await getUserById(userId);
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        user_level: user.User_level,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Then use it in your route
router.get("/profile", authenticate, getProfile);

router.put("/me", authenticate, updateUserInfo);
router.delete("/me", authenticate, deleteUserAccount);

// Add these new routes
router.post("/onboarding/responses", authenticate, saveOnboardingResponses);
router.get("/onboarding/status", authenticate, getOnboardingStatus);
router.post("/profile", authenticate, updateUserProfile);

export default router;
