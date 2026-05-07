// models/propertytagging/assetHistoryModel.js

import mongoose from "mongoose";

const assetHistorySchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    actionType: {
      type: String,
      enum: ["LOCATION_CHANGE", "STATUS_CHANGE", "REMARKS_UPDATE"],
      required: true,
    },

    oldValue: {
      type: String,
      default: "",
    },

    newValue: {
      type: String,
      default: "",
    },

    changedBy: {
      type: String,
      default: "System",
    },
  },
  {
    timestamps: true,
  },
);

const AssetHistory = mongoose.model(
  "AssetHistory",
  assetHistorySchema,
);

export default AssetHistory;