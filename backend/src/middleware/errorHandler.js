function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === "development";

  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  // Don't send response if headers already sent (e.g. SSE stream started)
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
