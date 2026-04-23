import express from "express";
import {
  createSingleAsset,
  bulkCreateAssets,
  fetchAssets,
  getAssetById,
  getAssetQRCode,
} from "../controllers/assetController.js";

const router = express.Router();

/* =========================
   CREATE ASSET
   POST /api/asset/assets
========================= */
router.post("/assets", createSingleAsset);

/* =========================
   BULK CREATE
   POST /api/asset/assets/bulk-create
========================= */
router.post("/assets/bulk-create", bulkCreateAssets);

/* =========================
   GET ALL ASSETS
   GET /api/asset/assets
========================= */
router.get("/assets", fetchAssets);

/* =========================
   GET SINGLE ASSET
   GET /api/asset/assets/:id
========================= */
router.get("/assets/:id", getAssetById);

/* =========================
   QR CODE IMAGE
   GET /api/asset/assets/:id/qrcode
========================= */
router.get("/assets/:id/qrcode", getAssetQRCode);

export default router;
