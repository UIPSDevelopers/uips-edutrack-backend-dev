import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const CategoriesModel = mongoose.model("Category", categorySchema);
export default CategoriesModel;
