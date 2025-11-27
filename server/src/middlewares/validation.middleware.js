import asyncHandler from "../utils/asyncHandler.js";

export const validate = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    req.body = value;
    next();
  });
};

