import express from "express";
import {
  addLocation,
  getAllLocations,
  updateLocation,
  deleteLocation,
} from "../controllers/locationsController.js";

const router = express.Router();

// CREATE
router.post("/", addLocation);

// READ
router.get("/", getAllLocations);

// UPDATE
router.put("/:id", updateLocation);

// DELETE
router.delete("/:id", deleteLocation);

export default router;
