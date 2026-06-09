import express from "express";
import {
  addLocation,
  getAllLocations,
  updateLocation,
  deleteLocation,
  getAllLocationsNoPagination,
} from "../controllers/locationsController.js";

const router = express.Router();


router.post("/", addLocation);


router.get("/", getAllLocations);


router.get("/all", getAllLocationsNoPagination);


router.put("/:id", updateLocation);


router.delete("/:id", deleteLocation);

export default router;
