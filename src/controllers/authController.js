import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; 

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in environment variables.");
}




export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginValue = (email || username || "").trim();

    if (!loginValue || !password) {
      return res
        .status(400)
        .json({ message: "Email/username and password are required." });
    }

    
    const user = await User.findOne({
      $or: [{ email: loginValue }, { userId: loginValue }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email/username/user ID or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email/username/user ID or password." });
    }

    
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    
    const decoded = jwt.decode(token);
    const expiresAt = decoded.exp * 1000; 

    return res.status(200).json({
      message: "Login successful.",
      token,
      expiresIn: JWT_EXPIRES_IN,
      expiresAt, 
      user: {
        userId: user.userId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};




export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ userId: decoded.userId }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Verify token error:", error);

    
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    return res
      .status(401)
      .json({ message: "Invalid or expired token. Please log in again." });
  }
};




export const logout = (req, res) => {
  
  
  res.status(200).json({ message: "Logged out successfully." });
};
