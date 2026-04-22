import express from "express";
import {
  fetchAssets,
  getAssetById,
  addAssetService,
  getAssetQRCode,
} from "../controllers/assetController.js";

const router = express.Router();

// list
router.get("/assets", fetchAssets);

// detail page
router.get("/assets/:id", getAssetById);

// add service
router.post("/assets/:id/service", addAssetService);

router.get("/assets/:id/qrcode", getAssetQRCode);

export default router;
