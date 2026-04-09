import mongoose from "mongoose";

const assetMaintenanceSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    issueDescription: { type: String, required: true },
    reportedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    repairedDate: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

const AssetMaintenanceModel = mongoose.model("AssetMaintenance", assetMaintenanceSchema);
export default AssetMaintenanceModel;
