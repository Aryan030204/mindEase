const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorMiddleware;
