const AppError = require("./../Utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJWTExpiredError = () => {
  return new AppError("Your token has expired! Please log in again.", 401);
};
const handleJWTError = () => {
  return new AppError("Invalid Token. Please log in again!", 401);
};

const sendErrorDev = (err, req, res) => {
  // console.log("Development display Error", err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
  // if (req.originalUrl.startsWith('/api')) {
  //   res.status(err.statusCode).json({
  //     status: err.status,
  //     error: err,
  //     message: err.message,
  //     stack: err.stack,
  //   });
  // } else {
  //   res.status(err.statusCode).render('error', {
  //     title: 'Something went wrong!',
  //     msg: err.message,
  //   });
  // }
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Something went wront",
  });

  // if (req.originalUrl.startsWith('/api')) {
  //   if (err.isOperational) {
  //     return res.status(err.statusCode).json({
  //       status: err.status,
  //       message: err.message,
  //     });
  //   }

  //   return res.status(500).json({
  //     status: 'error',
  //     message: 'Something went wront',
  //   });
  // }

  // if (err.isOperational) {
  //   return res.status(err.statusCode).render('error', {
  //     title: 'Something went wrong!',
  //     msg: err.message,
  //   });
  // }

  // return res.status(err.statusCode).render('error', {
  //   title: 'Something went wrong!',
  //   msg: 'Please try again later.',
  // });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
