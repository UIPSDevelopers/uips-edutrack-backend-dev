import express from "express";
import {
  fetchAssets,
  getAssetById,
  addAssetService,
  getAssetQRCode,
} from "../controllers/assetController.js";

const router = express.Router();


router.get("/assets", fetchAssets);


router.get("/assets/:id", getAssetById);


router.post("/assets/:id/service", addAssetService);

router.get("/assets/:id/qrcode", getAssetQRCode);

export default router;
