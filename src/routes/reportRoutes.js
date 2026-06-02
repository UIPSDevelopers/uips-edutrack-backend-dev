import express from "express";
import {
  getDeliveryReport,
  getCheckoutReport,
  getInventoryReport,
  getSummaryReport,
  getReturnsReport,
} from "../controllers/reportController.js";
import { getAssetReports, getAssetStats } from "../controllers/assetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/delivery", getDeliveryReport);
router.get("/checkout", getCheckoutReport);
router.get("/returns", getReturnsReport);
router.get("/inventory", getInventoryReport);
router.get("/summary", getSummaryReport);
router.get("/asset", getAssetReports);

// Protected asset stats endpoint used by frontend dashboard
router.get("/asset/stats", protect, getAssetStats);

export default router;
