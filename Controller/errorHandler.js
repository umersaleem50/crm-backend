const apiError = require("../Util/apiError");

/**
 * Handle the expired JWT token error
 * @returns return new error with message
 */

const handleJWTExpiredError = () => {
  return new apiError(`Your token has expired! Please log in again.`, 401);
};

/**
 * Handle the JWT error, or invalid token error
 * @returns return new error with message
 */

const handleJWTError = () => {
  return new apiError(`Invalid Token, Please log in again!`, 401);
};

/**
 * Handle the Cast Error caused by Database
 * @param {Object} error Error casue by API, if the Id of the document is given invalid
 * @returns return Error with new message
 */

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new apiError(message, 400);
};

/**
* Handle the validation error of API
@param Object [error] Error cause by API
@return A new error with a message
*/

const handleValidationError = (error) => {
  const errorMessage = Object.values(error.errors).map((el, i) => el.message);
  return new apiError(errorMessage.join(" ,"), 400);
};

/**
* Prevent the dublication of the document
* If the exist a document with same data then it will throw an error
* and this function will handle that data
@param Object [error] Error cause by API
@return A new error with a message
*/

const handleDublicateValueErrorDB = (error) => {
  const values = error.message.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Dublicate value ${values}. Please use another value.`;
  return new apiError(message, 400);
};

/**
* Send the error message if the the error is handled correctly.
* This will be only run if the enviroment is on production
@param Object [err] Error cause by API
@param Object [req] Request to the API
@param Object [res] Response by the API
@return A response with error message
*/

const sendProdError = (err, req, res) => {
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }

  return res
    .status(500)
    .json({ status: "error", message: "Something went wrong!" });
};

/**
* Handle all the error caused by the API
@param Object [err] Error cause by API
@param Object [req] Request Object of API
@param Object [res] Respone Object of API

*/

exports.errorHandlerController = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    return res
      .status(statusCode)
      .json({ status, message: err.message, error: err });
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "ValidationError") {
      error = handleValidationError(err);
    }
    if (err.code === 11000) {
      error = handleDublicateValueErrorDB(err);
    }
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.name === `JsonWebTokenError`) error = handleJWTError();
    if (error.name === `TokenExpiredError`) error = handleJWTExpiredError();
    sendProdError(error, req, res);
  }
};
