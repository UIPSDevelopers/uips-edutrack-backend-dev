import mongoose from "mongoose";


const itemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  sizeOrSource: { type: String, default: "-" }, 
  gradeLevel: { type: String, default: "-" }, 
  quantity: { type: Number, required: true },
  condition: { type: String, enum: ["Good", "Damaged"], default: "Good" },
  remarks: { type: String, default: "" },
});


const returnSchema = new mongoose.Schema(
  {
    
    returnNumber: { type: String, unique: true, required: true },

    
    receiptRef: { type: String, required: true },

    
    transactionRef: { type: String },

    
    returnedBy: { type: String, required: true },

    
    reason: { type: String, default: "" },

    
    items: [itemSchema],

    
    dateReturned: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Return", returnSchema);
