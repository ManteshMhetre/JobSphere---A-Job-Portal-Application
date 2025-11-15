class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  // Log all errors for debugging
  console.error(`Error (${err.statusCode}): ${err.message}`);
  if (err.stack) console.error(err.stack);

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "MongooseServerSelectionError" || err.message.includes("buffering timed out")) {
    const message = `Database connection timed out. Please try again later.`;
    err = new ErrorHandler(message, 503);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};


export default ErrorHandler