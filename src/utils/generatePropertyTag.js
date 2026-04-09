import CountersModel from "../models/propertytagging/assetCountersModel.js";
import Category from "../models/propertytagging/categoriesModel.js";

export const generatePropertyTag = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category || !category.code) throw new Error("Category not found");

  const prefix = category.code.toUpperCase(); // e.g., ELEC

  const counter = await CountersModel.findOneAndUpdate(
    { _id: prefix }, // string _id
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const paddedNumber = counter.seq.toString().padStart(6, "0");

  return `${prefix}-${paddedNumber}`; // ELEC-000001
};
