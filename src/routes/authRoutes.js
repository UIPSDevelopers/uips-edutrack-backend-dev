import express from "express";
import { loginUser, verifyToken, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, verifyToken); // Protected: verify logged-in user
router.post("/logout", protect, logout); // Protected: logout endpoint

export default router;
