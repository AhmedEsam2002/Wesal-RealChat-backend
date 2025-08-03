import AppError from '../utils/appError.js';

const sendErrorDev = (err, res, req) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
    stack: err.stack,
    error: err,
  });
};
const sendErrorProd = (err, res, req) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message || 'Internal Server Error',
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
const CastErrorHandler = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};
const handleValidationErrorDB = (err) =>
  new AppError(
    `Validation Error: ${Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')}`,
    400
  );
const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  return new AppError(
    `Duplicate field value: "${value}". Please use another value!`,
    400
  );
};
const handleJsonWebTokenError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleGlobalError = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res, req);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    if (error.name === 'CastError') {
      error = CastErrorHandler(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    sendErrorProd(error, res, req);
  }
};
export default handleGlobalError;
