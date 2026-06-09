import CountersModel from "../models/propertytagging/assetCountersModel.js";
import Category from "../models/propertytagging/categoriesModel.js";







export const generatePropertyTag = async (categoryId) => {
  try {
    
    
    
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

    
    
    
    const prefix = category.code.trim().toUpperCase();

    
    
    
    
    
    
    
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

    
    
    
    const sequenceNumber = counter.seq || 1;

    const paddedNumber = String(sequenceNumber).padStart(6, "0");

    
    
    
    return `${prefix}-${paddedNumber}`;
  } catch (error) {
    console.error("generatePropertyTag error:", error);

    throw new Error(error.message || "Failed to generate property tag");
  }
};