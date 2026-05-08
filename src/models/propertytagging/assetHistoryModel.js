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

    changedBy: {
      type: String,
      default: "System",
    },

    // 🔥 CLEAN STRUCTURED CHANGE LOG
    changes: {
      location: {
        old: {
          type: String,
          default: null,
        },

        new: {
          type: String,
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

export default mongoose.model("AssetHistory", assetHistorySchema);
