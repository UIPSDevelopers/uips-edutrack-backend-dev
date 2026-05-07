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
      enum: ["ACTIVE", "BROKEN", "DISPOSED"],
      default: "ACTIVE",
    },
    purchaseDate: {
      type: Date,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
  },
  { timestamps: true }
);

const AssetModel = mongoose.model("Asset", assetSchema);
export default AssetModel;
