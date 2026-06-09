import express from "express";
import { loginUser, verifyToken, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, verifyToken); 
router.post("/logout", protect, logout); 

export default router;
