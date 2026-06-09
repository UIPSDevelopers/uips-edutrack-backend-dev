import express from "express";
import {
  addItem,
  getAllItems,
  updateItem,
  deleteItem,
  getItemByBarcode,
  bulkAddItems, 
} from "../controllers/inventoryController.js";

import { verifyToken } from "../middleware/authMiddleware.js";   
import { authorizeRole } from "../middleware/authorizeRole.js"; 

const router = express.Router();



router.get(
  "/",
  verifyToken,
  authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"),
  getAllItems
);



router.get(
  "/barcode/:barcode",
  verifyToken,
  authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"),
  getItemByBarcode
);



router.post(
  "/add",
  verifyToken,
  authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"),
  addItem
);



router.post(
  "/bulk-add",
  verifyToken,
  authorizeRole("IT", "InventoryStaff", "Accounts", "InventoryAdmin"),
  bulkAddItems
);



router.put(
  "/:id",
  verifyToken,
  authorizeRole("IT", "Accounts", "InventoryAdmin"),
  updateItem
);



router.delete(
  "/:id",
  verifyToken,
  authorizeRole("IT", "InventoryAdmin"),
  deleteItem
);

export default router;
