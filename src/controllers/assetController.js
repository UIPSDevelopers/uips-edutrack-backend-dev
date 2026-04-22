import Asset from "../models/propertytagging/assetsModel.js";
import Category from "../models/propertytagging/categoriesModel.js";
import locationsModel from "../models/propertytagging/locationsModel.js";
import AssetService from "../models/propertytagging/assetServiceModel.js";

import { generatePropertyTag } from "../utils/generatePropertyTag.js";
import { generateQRCode } from "../utils/generateQRCode.js";

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

    const location = locationId
      ? await locationsModel.findById(locationId)
      : null;

    const propertyTagNumber = await generatePropertyTag(categoryId);

    const asset = await Asset.create({
      serialNo: propertyTagNumber,
      assetName,
      categoryId,
      brand,
      model,
      locationId,
      purchaseDate,
      status,
      remarks,
    });

    const qrCode = await generateQRCode({
      serialNo: asset.serialNo,
      assetName: asset.assetName,
      categoryName: category.name,
      locationName: location?.name || "",
    });

    return res.status(201).json({ asset, qrCode });
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
    const {
      categoryId,
      locationId,
      assetName,
      brand,
      model,
      purchaseDate,
      quantity,
      status = "Active",
      remarks = "",
    } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const location = locationId
      ? await locationsModel.findById(locationId)
      : null;

    const assets = [];

    for (let i = 0; i < quantity; i++) {
      const propertyTagNumber = await generatePropertyTag(categoryId);

      const asset = await Asset.create({
        serialNo: propertyTagNumber,
        assetName,
        categoryId,
        brand,
        model,
        locationId,
        purchaseDate,
        status,
        remarks,
      });

      assets.push(asset);
    }

    return res.status(201).json({ assets });
  } catch (error) {
    console.error("bulkCreateAssets error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET ALL ASSETS (WITH SEARCH)
========================================================= */
export const fetchAssets = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { assetName: { $regex: search, $options: "i" } },
          { serialNo: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
        ],
      };
    }

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
   GET SINGLE ASSET + SERVICE HISTORY
========================================================= */
export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id)
      .populate("categoryId", "name code")
      .populate("locationId", "name building floor");

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const services = await AssetService.find({ assetId: id }).sort({
      serviceDate: -1,
    });

    return res.status(200).json({
      asset,
      services,
    });
  } catch (error) {
    console.error("getAssetById error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   ADD SERVICE TO ASSET
========================================================= */
export const addAssetService = async (req, res) => {
  try {
    const { id } = req.params;

    const { type, date, remarks, cost, performedBy } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // ✅ validate service type against enum
    const allowedTypes = ["Cleaning", "Repair", "Maintenance", "Inspection"];

    const serviceType = allowedTypes.includes(type) ? type : "Maintenance"; // safe fallback (valid enum)

    // ✅ fix date issue
    const serviceDate = date ? new Date(date) : new Date();

    if (date && isNaN(serviceDate.getTime())) {
      return res.status(400).json({
        message: "Invalid service date",
      });
    }

    const service = await AssetService.create({
      assetId: id,
      serviceType,
      description: remarks || "",
      cost: cost || 0,
      performedBy: performedBy || "N/A",
      serviceDate,
    });

    return res.status(201).json(service);
  } catch (error) {
    console.error("addAssetService error:", error);
    return res.status(500).json({ message: error.message });
  }
};
