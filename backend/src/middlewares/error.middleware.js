export const notFoundMiddleware = (_req, _res, next) => {
  const error = new Error("Route not found.");
  error.statusCode = 404;
  next(error);
};

export const errorMiddleware = (error, _req, res, _next) => {
  // Express body-parser payload too large
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request too large. Please reduce image sizes and try again."
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message
  });
};
