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
      enum: [
        "ASSET_CREATED",
        "LOCATION_CHANGE",
        "STATUS_CHANGE",
        "REMARKS_CHANGE",
      ],
      required: true,
    },

    // Who did it
    changedBy: {
      type: String,
      default: "System",
    },

    // Store structured changes (IMPORTANT FIX)
    changes: {
      location: {
        old: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
          default: null,
        },
        new: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
          default: null,
        },
      },

      status: {
        old: { type: String, default: "" },
        new: { type: String, default: "" },
      },

      remarks: {
        old: { type: String, default: "" },
        new: { type: String, default: "" },
      },
    },
  },
  { timestamps: true },
);

const AssetHistory = mongoose.model("AssetHistory", assetHistorySchema);

export default AssetHistory;
