import LocationsModel from "../models/propertytagging/locationsModel.js";

/**
 * @desc    Add new location
 * @route   POST /api/locations
 */
export const addLocation = async (req, res) => {
  try {
    const { name, building, floor, description } = req.body;

    // Validate required field
    if (!name) {
      return res.status(400).json({
        message: "Location name is required",
      });
    }

    // Check duplicate name
    const existingLocation = await LocationsModel.findOne({ name });

    if (existingLocation) {
      return res.status(400).json({
        message: "Location already exists",
      });
    }

    const newLocation = await LocationsModel.create({
      name,
      building,
      floor,
      description,
    });

    return res.status(201).json({
      message: "Location added successfully",
      data: newLocation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all locations (pagination + search)
 * @route   GET /api/locations?page=1&limit=10&search=room
 */
export const getAllLocations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchFilter = {
      name: { $regex: search, $options: "i" },
    };

    const total = await LocationsModel.countDocuments(searchFilter);

    const locations = await LocationsModel.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      data: locations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update location
 * @route   PUT /api/locations/:id
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, building, floor, description } = req.body;

    const location = await LocationsModel.findById(id);

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    // check duplicate name
    const existingLocation = await LocationsModel.findOne({
      name,
      _id: { $ne: id },
    });

    if (existingLocation) {
      return res.status(400).json({
        message: "Location name already exists",
      });
    }

    location.name = name || location.name;
    location.building = building || location.building;
    location.floor = floor || location.floor;
    location.description = description || location.description;

    const updated = await location.save();

    return res.status(200).json({
      message: "Location updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete location
 * @route   DELETE /api/locations/:id
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await LocationsModel.findById(id);

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    await location.deleteOne();

    return res.status(200).json({
      message: "Location deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
