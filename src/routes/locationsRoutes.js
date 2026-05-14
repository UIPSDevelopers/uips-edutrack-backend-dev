import express from "express";
import {
  addLocation,
  getAllLocations,
  updateLocation,
  deleteLocation,
  getAllLocationsNoPagination,
} from "../controllers/locationsController.js";

const router = express.Router();

// CREATE
router.post("/", addLocation);

// READ
router.get("/", getAllLocations);

// READ ALL (no pagination)
router.get("/all", getAllLocationsNoPagination);

// UPDATE
router.put("/:id", updateLocation);

// DELETE
router.delete("/:id", deleteLocation);

export default router;
