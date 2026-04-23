import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import returnRoutes from "./routes/returnRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import locationRoutes from "./routes/locationsRoutes.js";
import propertyTaggingRoutes from "./routes/propertyTaggingRoutes.js";

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "https://edutrack.uips.online",
  "http://localhost:5173",
  "https://uips-edutrack-dev.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

/* =========================
   BODY PARSER
========================= */
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "EduTrack backend running",
    time: new Date().toISOString(),
  });
});

/* =========================
   MONGODB
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

/* =========================
   ROUTES
========================= */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/checkouts", checkoutRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/property-tagging", propertyTaggingRoutes);

/* ✅ FINAL CLEAN DESIGN */
app.use("/api/asset", assetRoutes);

app.use("/api/categories", categoriesRoutes);
app.use("/api/locations", locationRoutes);

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`),
);
