const rateLimiter = require("express-rate-limit");

/**
 * Limits the number of request per 1 hour
 * @param {number} numberOfRequests Number of request allowed per 1 hours,
 * number of requests exceed then it will block the ip.
 * @returns Middleware
 */
const limiter = (numberOfRequests) =>
  rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 21000,
    // max: process.env.NODE_ENV !== "development" ? numberOfRequests : 100,

    message: "To many request from this IP, please try again in a hour!.",
  });

module.exports = limiter;
