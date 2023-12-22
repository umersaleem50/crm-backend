class apiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode?.toString()?.startsWith("4") ? "failed" : "sucess";

    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = apiError;
