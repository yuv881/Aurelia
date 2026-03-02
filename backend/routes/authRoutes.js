import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { verifyGoogleToken } from "../controllers/googleAuthController.js";

const router = express.Router();

// ── Standard email/password ──────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);

// ── Google OAuth (ID-token from frontend "Sign in with Google" button) ───────
router.post("/google/verify", verifyGoogleToken);

export default router;
