import asyncHandler from "../utils/asyncHandler.js";
import Resource from "../models/Resource.model.js";

// -----------------------------------------------------
// Fetch All Resources
// -----------------------------------------------------
export const getAllResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find().sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Resources fetched successfully",
    resources,
  });
});

// -----------------------------------------------------
// Fetch Resources by Category
// -----------------------------------------------------
export const getResourcesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

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

  const resources = await Resource.find({ category }).sort({
    createdAt: -1,
  });

  return res.status(200).json({
    message: "Category resources fetched successfully",
    resources,
  });
});

// -----------------------------------------------------
// Add Resource (Admin Only)
// -----------------------------------------------------
export const addResource = asyncHandler(async (req, res) => {
  const { title, category, contentURL, description } = req.body;

  const resource = await Resource.create({
    title,
    category,
    contentURL,
    description,
    createdBy: req.user.id,
  });

  return res.status(201).json({
    message: "Resource added successfully",
    resource,
  });
});
