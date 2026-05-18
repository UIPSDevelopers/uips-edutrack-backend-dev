import CountersModel from "../models/propertytagging/assetCountersModel.js";
import Category from "../models/propertytagging/categoriesModel.js";

/* =========================================================
   GENERATE PROPERTY TAG
   Example:
   CLRM-000001
   CHAR-000001
========================================================= */
export const generatePropertyTag = async (categoryId) => {
  try {
    // =========================
    // VALIDATE CATEGORY
    // =========================
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    if (!category.code) {
      throw new Error("Category code is missing");
    }

    // =========================
    // CATEGORY PREFIX
    // =========================
    const prefix = category.code.trim().toUpperCase();

    // =========================
    // GET / CREATE COUNTER
    // Each category has its own counter
    // Example:
    // CLRM -> 1,2,3...
    // CHAR -> 1,2,3...
    // =========================
    const counter = await CountersModel.findOneAndUpdate(
      { _id: prefix },
      {
        $inc: { seq: 1 },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    // =========================
    // FORMAT NUMBER
    // =========================
    const sequenceNumber = counter.seq || 1;

    const paddedNumber = String(sequenceNumber).padStart(6, "0");

    // =========================
    // FINAL SERIAL
    // =========================
    return `${prefix}-${paddedNumber}`;
  } catch (error) {
    console.error("generatePropertyTag error:", error);

    throw new Error(error.message || "Failed to generate property tag");
  }
};