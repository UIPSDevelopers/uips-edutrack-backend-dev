import Asset from "../models/propertytagging/assetsModel.js";
import Category from "../models/propertytagging/categoriesModel.js";
import Location from "../models/propertytagging/locationsModel.js";
import { generatePropertyTag } from "../utils/generatePropertyTag.js";
import { generateQRCode } from "../utils/generateQRCode.js";

/**
 * Create one asset manually
 */
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

    const category = await Category.findById(categoryId);
    const location = locationId ? await Location.findById(locationId) : null;

    if (!category) return res.status(400).json({ message: "Invalid category" });

    // Generate property tag
    const propertyTagNumber = await generatePropertyTag(categoryId);

    // Create asset
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

    // Generate QR code
    const qrCode = await generateQRCode({
      serialNo: asset.serialNo,
      assetName: asset.assetName,
      categoryName: category.name,
      locationName: location?.name || "",
    });

    res.status(201).json({ asset, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Bulk create assets
 */
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

    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const category = await Category.findById(categoryId);
    const location = locationId ? await Location.findById(locationId) : null;

    if (!category) return res.status(400).json({ message: "Invalid category" });

    const assets = [];

    // Create assets sequentially for correct property tag increment
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

    // Generate QR codes in parallel
    const qrCodes = await Promise.all(
      assets.map((asset) =>
        generateQRCode({
          serialNo: asset.serialNo,
          assetName: asset.assetName,
          categoryName: category.name,
          locationName: location?.name || "",
        }),
      ),
    );

    const result = assets.map((asset, index) => ({
      asset,
      qrCode: qrCodes[index],
    }));

    res.status(201).json({ assets: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const fetchAssets = async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate("categoryId", "name code")  // get category details
      .populate("locationId", "name building floor") 
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ message: error.message });
  }
};
