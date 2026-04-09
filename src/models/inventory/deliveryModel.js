import mongoose from "mongoose";

const DeliveryItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  itemName: String,
  itemType: String,
  sizeOrSource: String,
  gradeLevel: String,
  barcode: [String],
  quantity: { type: Number, default: 1 },
});

const DeliverySchema = new mongoose.Schema(
  {
    deliveryId: { type: String, unique: true, required: true }, // ✅ Custom delivery ID
    deliveryNumber: { type: String, required: true },
    supplier: { type: String },
    receivedBy: { type: String, required: true },
    dateReceived: {
      type: Date,
      default: () => new Date(),
    },
    items: [DeliveryItemSchema],
  },
  { timestamps: true },
);

// ✅ Prevent OverwriteModelError
const Delivery =
  mongoose.models.Delivery || mongoose.model("Delivery", DeliverySchema);

export default Delivery;
