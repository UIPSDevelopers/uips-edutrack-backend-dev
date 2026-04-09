import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    building: { type: String },
    floor: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const LocationsModel = mongoose.model("Location", locationSchema);
export default LocationsModel;
