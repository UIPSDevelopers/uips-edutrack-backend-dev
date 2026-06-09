import express from "express";
import {
  createSingleAsset,
  bulkCreateAssets,
  fetchAssets,
  getAssetById,
  getAssetQRCode,
  updateAsset,
  addAssetService,
} from "../controllers/assetController.js";
const router = express.Router();





router.post("/assets", createSingleAsset);





router.post("/assets/bulk-create", bulkCreateAssets);





router.get("/assets", fetchAssets);





router.get("/assets/:id", getAssetById);





router.get("/assets/:id/qrcode", getAssetQRCode);

router.put("/assets/:id", updateAsset);

router.post("/assets/:id/service", addAssetService);

export default router;
