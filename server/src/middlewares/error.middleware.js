const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR:", err);

  let statusCode = 500;
  let message = "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }
  // Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }
  // Mongoose cast error (invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }
  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  // Custom error with status code
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Default error message
  else if (err.message) {
    message = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
