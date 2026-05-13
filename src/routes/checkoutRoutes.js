import express from "express";
import {
  addCheckout,
  getCheckouts,
  getCheckoutById,
  deleteCheckout,
} from "../controllers/checkoutController.js";

const router = express.Router();

router.post("/add", addCheckout);
router.get("/", getCheckouts);
router.get("/:id", getCheckoutById); 
router.delete("/:id", deleteCheckout);

export default router;
