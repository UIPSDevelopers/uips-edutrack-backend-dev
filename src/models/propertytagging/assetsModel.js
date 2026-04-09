import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    serialNo: {
      type: String,
      required: true,
      unique: true,
    },
    assetName: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Needs Repair", "Disposed"],
      default: "Active",
    },
    purchaseDate: {
      type: Date,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "locationsModel",
    },
  },
  { timestamps: true }
);

const AssetModel = mongoose.model("Asset", assetSchema);
export default AssetModel;
