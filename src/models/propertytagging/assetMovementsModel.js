import mongoose from "mongoose";

const assetMovementSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    fromLocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    toLocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    movedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moveDate: { type: Date, default: Date.now },
    remarks: { type: String },
  },
  { timestamps: true }
);

const AssetMovementsModel = mongoose.model("AssetMovement", assetMovementSchema);
export default AssetMovementsModel;
