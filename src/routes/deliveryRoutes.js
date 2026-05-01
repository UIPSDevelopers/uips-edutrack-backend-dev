import express from "express";
import {
  addDelivery,
  getDeliveries,
  getDeliveryById,
  deleteDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/add", addDelivery);
router.get("/", getDeliveries);
router.get("/:id", getDeliveryById);
router.delete("/:id", deleteDelivery);

export default router;
