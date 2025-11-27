import asyncHandler from "../utils/asyncHandler.js";
import Resource from "../models/Resource.model.js";

// -----------------------------------------------------
// Fetch All Resources
// -----------------------------------------------------
export const getAllResources = asyncHandler(async (req, res) => {
  const { limit = 50, skip = 0, category } = req.query;

  // Check MongoDB connection
  const mongoose = (await import("mongoose")).default;
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: "Database not connected. Please try again in a moment." 
    });
  }

  const query = {};
  if (category) {
    query.category = category.toLowerCase();
  }

  const resources = await Resource.find(query).maxTimeMS(5000)
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Resource.countDocuments(query).maxTimeMS(5000);

  return res.status(200).json({
    message: "Resources fetched successfully",
    resources,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: parseInt(skip) + resources.length < total,
    },
  });
});

// -----------------------------------------------------
// Fetch Resources by Category
// -----------------------------------------------------
export const getResourcesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 50, skip = 0 } = req.query;

  // Check MongoDB connection
  const mongoose = (await import("mongoose")).default;
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: "Database not connected. Please try again in a moment." 
    });
  }

  const validCategories = [
    "articles",
    "meditation",
    "journaling",
    "exercise",
    "faqs",
  ];

  if (!validCategories.includes(category.toLowerCase())) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const resources = await Resource.find({ category: category.toLowerCase() }).maxTimeMS(5000)
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Resource.countDocuments({ category: category.toLowerCase() }).maxTimeMS(5000);

  return res.status(200).json({
    message: "Category resources fetched successfully",
    resources,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: parseInt(skip) + resources.length < total,
    },
  });
});

// -----------------------------------------------------
// Add Resource (Admin Only)
// -----------------------------------------------------
export const addResource = asyncHandler(async (req, res) => {
  const { title, category, contentURL, description } = req.body;
  const mongoose = (await import("mongoose")).default;
  const userId = mongoose.Types.ObjectId.isValid(req.user.id)
    ? new mongoose.Types.ObjectId(req.user.id)
    : req.user.id;

  const resource = await Resource.create({
    title,
    category: category.toLowerCase(),
    contentURL,
    description,
    createdBy: userId,
  });

  await resource.populate("createdBy", "firstName lastName email");

  return res.status(201).json({
    message: "Resource added successfully",
    resource,
  });
});
