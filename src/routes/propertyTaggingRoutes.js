import express from "express";
import {
  fetchAssets,
  getAssetById,
  addAssetService,
} from "../controllers/assetController.js";

const router = express.Router();

// list
router.get("/assets", fetchAssets);

// detail page
router.get("/assets/:id", getAssetById);

// add service
router.post("/assets/:id/service", addAssetService);

export default router;
