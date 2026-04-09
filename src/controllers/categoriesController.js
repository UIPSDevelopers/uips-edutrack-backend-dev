import categoriesModel from "../models/propertytagging/categoriesModel.js";

export const addCategory = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Validate required field
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await categoriesModel.findOne({
      $or: [{ name }, { code }],
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category name or code already exists",
      });
    }

    const newCategory = await categoriesModel.create({
      name,
      code: code?.toUpperCase(),
    });

    res.status(201).json({
      message: "Category added successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all categories (with pagination + search)
// @route   GET /api/categories?page=1&limit=10&search=elec
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Search filter (case insensitive)
    const searchFilter = {
      name: { $regex: search, $options: "i" },
    };

    const total = await categoriesModel.countDocuments(searchFilter);

    const categories = await categoriesModel.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: categories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const category = await categoriesModel.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check for duplicate name or code (excluding current category)
    const existingCategory = await categoriesModel.findOne({
      $or: [{ name }, { code }],
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category name or code already exists",
      });
    }

    category.name = name || category.name;
    category.code = code ? code.toUpperCase() : category.code;

    const updatedCategory = await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoriesModel.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


