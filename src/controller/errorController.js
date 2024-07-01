const AppError = require("../utils/appError");

const handleCastErrorDB = (error) => {
  const message = `Invalid ${err.path}: ${error.value}`;
  return new AppError(message, 400);
};
const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, res) => {
  //isOperational, trusted error: send error to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.log("Error", error);
    res.status(500).json({
      status: "error",
      message: "something went very wrong",
    });
  }
};

module.exports = (error, req, res, next) => {
  //console.log("errorstack :", error.stack);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let err = { ...err };

    if (err.name === "CastError") err = handleCastErrorDB(error);

    sendErrorProd(err, res);
  }
};
