export const errorHandler = (err, _req, res, _next) => {
  console.error("GLOBAL_ERROR_HANDLER:", err);
  const statusCode = err.statusCode || 500;

  if (err.name === "ValidationError") {
    const issues = Object.values(err.errors).map((issue) => issue.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: issues,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
