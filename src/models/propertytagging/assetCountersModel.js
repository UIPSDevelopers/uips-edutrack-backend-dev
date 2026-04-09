import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // category code
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AssetCountersModel =
  mongoose.models.AssetCounter ||
  mongoose.model("AssetCounter", counterSchema);

export default AssetCountersModel;

