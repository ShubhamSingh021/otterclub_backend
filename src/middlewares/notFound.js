export const notFound = (req, res) => {
  console.log(`NOT_FOUND_DEBUG: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
