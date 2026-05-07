import Asset from "../models/propertytagging/assetsModel.js";
import Category from "../models/propertytagging/categoriesModel.js";
import locationsModel from "../models/propertytagging/locationsModel.js";
import AssetService from "../models/propertytagging/assetServiceModel.js";
import AssetHistory from "../models/propertytagging/assetHistoryModel.js";

import { generatePropertyTag } from "../utils/generatePropertyTag.js";
import { generateQRCodeBuffer } from "../utils/generateQRCode.js";

import mongoose from "mongoose";

/* =========================================================
   CREATE SINGLE ASSET
========================================================= */
export const createSingleAsset = async (req, res) => {
  try {
    const {
      categoryId,
      locationId,
      assetName,
      brand,
      model,
      purchaseDate,
      status = "Active",
      remarks = "",
    } = req.body;

    if (!categoryId || !assetName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (locationId) {
      const location = await locationsModel.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: "Invalid location" });
      }
    }

    const asset = await Asset.create({
      serialNo: await generatePropertyTag(categoryId),
      assetName,
      categoryId,
      brand,
      model,
      locationId,
      purchaseDate,
      status,
      remarks,
    });

    // INITIAL HISTORY
    await AssetHistory.create({
      assetId: asset._id,
      actionType: "CREATE",

      oldLocation: null,
      newLocation: locationId || null,

      oldStatus: null,
      newStatus: status,

      oldRemarks: null,
      newRemarks: remarks,
    });

    return res.status(201).json({ asset });
  } catch (error) {
    console.error("createSingleAsset error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   BULK CREATE ASSETS
========================================================= */
export const bulkCreateAssets = async (req, res) => {
  try {
    const { assets } = req.body;

    if (!Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ message: "Assets array is required" });
    }

    const createdAssets = [];
    const errors = [];

    for (let i = 0; i < assets.length; i++) {
      try {
        const item = assets[i];

        const {
          categoryId,
          locationId,
          assetName,
          brand,
          model,
          purchaseDate,
          status = "Active",
          remarks = "",
        } = item;

        if (!categoryId || !assetName) {
          errors.push({ row: i + 1, error: "Missing required fields" });
          continue;
        }

        const category = await Category.findById(categoryId);
        if (!category) {
          errors.push({ row: i + 1, error: "Invalid category" });
          continue;
        }

        if (locationId) {
          const location = await locationsModel.findById(locationId);
          if (!location) {
            errors.push({ row: i + 1, error: "Invalid location" });
            continue;
          }
        }

        const asset = await Asset.create({
          serialNo: await generatePropertyTag(categoryId),
          assetName,
          categoryId,
          brand,
          model,
          locationId,
          purchaseDate,
          status,
          remarks,
        });

        await AssetHistory.create({
          assetId: asset._id,
          actionType: "CREATE",

          oldLocation: null,
          newLocation: locationId || null,

          oldStatus: null,
          newStatus: status,

          oldRemarks: null,
          newRemarks: remarks,
        });

        createdAssets.push(asset);
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    return res.status(201).json({
      count: createdAssets.length,
      failed: errors.length,
      errors,
      assets: createdAssets,
    });
  } catch (error) {
    console.error("bulkCreateAssets error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET ALL ASSETS
========================================================= */
export const fetchAssets = async (req, res) => {
  try {
    const { search } = req.query;

    const query = search
      ? {
          $or: [
            { assetName: { $regex: search, $options: "i" } },
            { serialNo: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { model: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const assets = await Asset.find(query)
      .populate("categoryId", "name code")
      .populate("locationId", "name building floor")
      .sort({ createdAt: -1 });

    return res.status(200).json({ assets });
  } catch (error) {
    console.error("fetchAssets error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET SINGLE ASSET + SERVICE + HISTORY
========================================================= */
export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const asset = await Asset.findById(id)
      .populate("categoryId", "name code")
      .populate("locationId", "name building floor");

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const services = await AssetService.find({ assetId: id }).sort({
      serviceDate: -1,
    });

    const history = await AssetHistory.find({ assetId: id })
      .populate("oldLocation", "name")
      .populate("newLocation", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      asset,
      services,
      history,
    });
  } catch (error) {
    console.error("getAssetById error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   ADD SERVICE
========================================================= */
export const addAssetService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      serviceType,
      description = "",
      cost = 0,
      performedBy = "N/A",
      serviceDate,
    } = req.body;

    if (!serviceType) {
      return res.status(400).json({ message: "Service type is required" });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const service = await AssetService.create({
      assetId: id,
      serviceType,
      description,
      cost: Number(cost),
      performedBy,
      serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
    });

    return res.status(201).json(service);
  } catch (error) {
    console.error("addAssetService error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   QR CODE
========================================================= */
export const getAssetQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const qrImage = await generateQRCodeBuffer(asset._id);

    res.setHeader("Content-Type", "image/png");
    return res.send(qrImage);
  } catch (error) {
    console.error("getAssetQRCode error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   UPDATE ASSET + HISTORY TRACKING
========================================================= */
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const oldLocation = asset.locationId?.toString() || null;
    const oldStatus = asset.status;
    const oldRemarks = asset.remarks || "";

    const { locationId, status, remarks } = req.body;

    // validate location
    if (locationId) {
      const location = await locationsModel.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: "Invalid location" });
      }
      asset.locationId = locationId;
    }

    if (status !== undefined) asset.status = status;
    if (remarks !== undefined) asset.remarks = remarks;

    await asset.save();

    const newLocation = asset.locationId?.toString() || null;

    const hasChange =
      oldLocation !== newLocation ||
      oldStatus !== asset.status ||
      oldRemarks !== asset.remarks;

    if (hasChange) {
      await AssetHistory.create({
        assetId: asset._id,
        actionType: "UPDATE",

        oldLocation,
        newLocation,

        oldStatus,
        newStatus: asset.status,

        oldRemarks,
        newRemarks: asset.remarks,
      });
    }

    return res.status(200).json({
      message: "Asset updated successfully",
      asset,
    });
  } catch (error) {
    console.error("updateAsset error:", error);
    return res.status(500).json({ message: error.message });
  }
};
