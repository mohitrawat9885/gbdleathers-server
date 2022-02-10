const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Customers = require('./Customer/CustomerModel');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../Utils/appError');
const Email = require('../Utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_CUSTOMER, {
    expiresIn: process.env.JWT_EXPIRES_IN_CUSTOMER,
  });
};

const createSendToken = (customer, statusCode, req, res) => {
  const token = signToken(customer._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  customer.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      customer,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newCustomer = await Customers.create(req.body);
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcome();
  createSendToken(newCustomer, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const customer = await Customers.findOne({ email: email }).select(
    '+password'
  );
  if (
    !customer ||
    !(await customer.correctPassword(password, customer.password))
  ) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  createSendToken(customer, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //  1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log('Cookie', req.cookies.jwt);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_CUSTOMER
  );

  // 3) Check if user still exists
  const currentUser = await Customers.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  //  Grant Access to protected route
  req.customer = currentUser;
  req.body.customer = currentUser._id;
  res.locals.customer = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email

  const customer = await Customers.findOne({ email: req.body.email });
  if (!customer) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = customer.createPasswordResetToken();
  await customer.save({ validateBeforeSave: false });
  // 3) Send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/reset-password/${resetToken}`;

    await new Email(customer, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    customer.passwordResetToken = undefined;
    customer.passwordResetExpires = undefined;
    await customer.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const customer = await Customers.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!customer) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  customer.password = req.body.password;
  customer.passwordConfirm = req.body.passwordConfirm;
  customer.passwordResetToken = undefined;
  customer.passwordResetExpires = undefined;
  await customer.save();

  // 3) Update changedPasswordAt property for the user
  // 3) Log the user in, send JWT

  createSendToken(customer, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const customer = await Customers.findById(req.customer._id).select(
    '+password'
  );

  // 2) Check is POSTed current password is correct
  if (
    !(await customer.correctPassword(
      req.body.passwordCurrent,
      customer.password
    ))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) If so, update password
  customer.password = req.body.password;
  customer.passwordConfirm = req.body.passwordConfirm;
  await customer.save();
  // User.findByIdAndUpdate will NOT work as intented!.
  // 4) Log user in, send JWT

  createSendToken(customer, 200, req, res);
});
