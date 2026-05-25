import asyncHandler from "../utils/asyncHandler.js";

export const validate = (schema, property = "body") => {
  return asyncHandler(async (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
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

    req[property] = value;
    next();
  });
};

