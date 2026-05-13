import express from "express";
import {
  getDeliveryReport,
  getCheckoutReport,
  getInventoryReport,
  getSummaryReport,
  getReturnsReport,
} from "../controllers/reportController.js";
import { getAssetReports } from "../controllers/assetController.js"

const router = express.Router();

router.get("/delivery", getDeliveryReport);
router.get("/checkout", getCheckoutReport);
router.get("/returns", getReturnsReport);
router.get("/inventory", getInventoryReport);
router.get("/summary", getSummaryReport);
router.get("/asset", getAssetReports);

export default router;
