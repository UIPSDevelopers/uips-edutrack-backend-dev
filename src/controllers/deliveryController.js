import mongoose from "mongoose";
import Delivery from "../models/inventory/deliveryModel.js";
import Inventory from "../models/inventory/inventoryModel.js";
import Counter from "../models/inventory/counter.js";

// 🧮 Generate unique delivery ID (SAFE - no race condition)
const generateDeliveryId = async (session) => {
  const counter = await Counter.findOneAndUpdate(
    { name: "delivery" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return `DEL-${counter.seq.toString().padStart(6, "0")}`;
};



// ➕ Add new delivery (SAFE + TRANSACTION)
export const addDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryNumber, supplier, receivedBy, items } = req.body;

    if (!deliveryNumber || !receivedBy || !Array.isArray(items) || items.length === 0) {
      throw new Error("Delivery number, receivedBy, and items are required.");
    }

    // 🧮 Generate ID safely
    const deliveryId = await generateDeliveryId(session);

    // ✅ Prepare items
    const formattedItems = items.map((i, index) => {
      if (!i.itemId || !i.quantity) {
        throw new Error(`Invalid item at index ${index}`);
      }

      return {
        itemId: i.itemId,
        itemName: i.itemName || "",
        itemType: i.itemType || "",
        sizeOrSource: i.sizeOrSource || "",
        gradeLevel: i.gradeLevel || "",
        barcode: i.barcode || [],
        quantity: Number(i.quantity) || 0,
      };
    });

    // ✅ Create delivery
    const delivery = await Delivery.create(
      [
        {
          deliveryId,
          deliveryNumber: deliveryNumber.toString().trim(),
          supplier: supplier || "",
          receivedBy,
          dateReceived: new Date(),
          items: formattedItems,
        },
      ],
      { session }
    );

    // ✅ Update inventory (atomic)
    for (const item of formattedItems) {
      const existing = await Inventory.findOne({ itemId: item.itemId }).session(session);

      if (!existing) {
        throw new Error(`Inventory item not found: ${item.itemId}`);
      }

      existing.quantity = (existing.quantity || 0) + item.quantity;
      await existing.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "✅ Delivery added successfully.",
      delivery: delivery[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Error adding delivery:", error);
    res.status(500).json({
      message: error.message || "Server error while adding delivery.",
    });
  }
};



// 🗑️ DELETE DELIVERY (WITH INVENTORY ROLLBACK)
export const deleteDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const delivery = await Delivery.findOne({ deliveryId: id }).session(session);

    if (!delivery) {
      throw new Error("Delivery not found.");
    }

    // 🔄 Rollback inventory
    for (const item of delivery.items) {
      const existing = await Inventory.findOne({ itemId: item.itemId }).session(session);

      if (!existing) {
        throw new Error(`Inventory item not found: ${item.itemId}`);
      }

      const newQty = (existing.quantity || 0) - item.quantity;

      if (newQty < 0) {
        throw new Error(`Stock would go negative for item ${item.itemId}`);
      }

      existing.quantity = newQty;
      await existing.save({ session });
    }

    // 🗑️ Delete delivery
    await Delivery.deleteOne({ deliveryId: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "✅ Delivery deleted and inventory rolled back successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Error deleting delivery:", error);
    res.status(500).json({
      message: error.message || "Server error while deleting delivery.",
    });
  }
};



// 📋 Get all deliveries
export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .sort({ createdAt: -1 })
      .select("-_id -__v");

    res.status(200).json(deliveries);
  } catch (error) {
    console.error("❌ Error fetching deliveries:", error);
    res.status(500).json({ message: "Server error fetching deliveries." });
  }
};



// 🔍 Get delivery by ID
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      deliveryId: req.params.id,
    }).select("-_id -__v");

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found." });
    }

    res.status(200).json(delivery);
  } catch (error) {
    console.error("❌ Error fetching delivery:", error);
    res.status(500).json({ message: "Server error fetching delivery." });
  }
};
