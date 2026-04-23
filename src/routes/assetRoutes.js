import express from "express";
import {
  createSingleAsset,
  bulkCreateAssets,
  fetchAssets,
  getAssetQRCode,
  getAssetById
} from "../controllers/assetController.js";

const router = express.Router();

// Manual single asset creation
router.post("/asset/create", createSingleAsset);

// Bulk asset creation
router.post("/assets/bulk-create", bulkCreateAssets);

// Fetch all assets
router.get("/assets", fetchAssets);

router.get("/assets/:id/qrcode", getAssetQRCode);

router.get("/assets/:id", getAssetById);

export default router;
