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

    let locationName = null;

    if (locationId) {
      const location = await locationsModel.findById(locationId);

      if (!location) {
        return res.status(400).json({ message: "Invalid location" });
      }

      locationName = location.name;
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
      actionType: "ASSET_CREATED",
      changes: {
        location: {
          old: null,
          new: locationName || null,
        },
        status: {
          old: null,
          new: status,
        },
        remarks: {
          old: null,
          new: remarks,
        },
      },
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

        let locationName = null;

        if (locationId) {
          const location = await locationsModel.findById(locationId);

          if (!location) {
            return res.status(400).json({ message: "Invalid location" });
          }

          locationName = location.name;
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
          actionType: "ASSET_CREATED",
          changes: {
            location: {
              old: null,
              new: locationName || null,
            },
            status: {
              old: null,
              new: status,
            },
            remarks: {
              old: null,
              new: remarks,
            },
          },
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
   GET SINGLE ASSET + HISTORY
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

    const history = await AssetHistory.find({ assetId: id }).sort({
      createdAt: -1,
    });

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
   UPDATE ASSET + FIELD-BASED HISTORY TRACKING
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

    let oldLocation = "Unassigned";

    if (asset.locationId) {
      const oldLocationData = await locationsModel.findById(asset.locationId);

      oldLocation = oldLocationData?.name || "Unknown Location";
    }
    const oldStatus = asset.status;
    const oldRemarks = asset.remarks || "";

    const { locationId, status, remarks } = req.body;

    const historyRecords = [];

    // ========================
    // LOCATION CHANGE
    // ========================
    if (locationId) {
      const location = await locationsModel.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: "Invalid location" });
      }

      asset.locationId = locationId;

      historyRecords.push({
        assetId: asset._id,
        actionType: "LOCATION_CHANGE",
        changes: {
          location: {
            old: oldLocation,
            new: location.name,
          },
        },
      });
    }

    // ========================
    // STATUS CHANGE
    // ========================
    if (status !== undefined && status !== oldStatus) {
      asset.status = status;

      historyRecords.push({
        assetId: asset._id,
        actionType: "STATUS_CHANGE",
        changes: {
          status: {
            old: oldStatus,
            new: status,
          },
        },
      });
    }

    // ========================
    // REMARKS CHANGE
    // ========================
    if (remarks !== undefined && remarks !== oldRemarks) {
      asset.remarks = remarks;

      historyRecords.push({
        assetId: asset._id,
        actionType: "REMARKS_CHANGE",
        changes: {
          remarks: {
            old: oldRemarks,
            new: remarks,
          },
        },
      });
    }

    await asset.save();

    if (historyRecords.length > 0) {
      await AssetHistory.insertMany(historyRecords);
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

export const getAssetReports = async (req, res) => {
  try {
    const { from, to, type } = req.query;

    const dateFilter = {};

    if (from && to) {
      dateFilter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // ======================
    // HISTORY REPORTS
    // ======================
    if (type === "MOVEMENT") {
      const data = await AssetHistory.find({
        actionType: "LOCATION_CHANGE",
        ...dateFilter,
      }).populate("assetId", "assetName serialNo");

      return res.json({ data });
    }

    if (type === "STATUS") {
      const data = await AssetHistory.find({
        actionType: "STATUS_CHANGE",
        ...dateFilter,
      }).populate("assetId", "assetName serialNo");

      return res.json({ data });
    }

    // ======================
    // SERVICE REPORT
    // ======================
    if (type === "SERVICE") {
      const data = await AssetService.find(dateFilter).populate(
        "assetId",
        "assetName serialNo",
      );

      return res.json({ data });
    }

    // ======================
    // DEFAULT: ASSET SUMMARY
    // ======================
    const data = await Asset.find()
      .populate("categoryId", "name")
      .populate("locationId", "name");

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
