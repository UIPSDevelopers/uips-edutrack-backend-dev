import mongoose from "mongoose";

const assetServiceSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    serviceType: {
      type: String,
      enum: ["Cleaning", "Repair", "Maintenance", "Inspection"],
      required: true,
    },

    description: String,
    cost: Number,

    performedBy: String,

    serviceDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AssetService", assetServiceSchema);
