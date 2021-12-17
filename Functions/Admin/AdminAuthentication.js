const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const users = require("../../Models/userModel");

const exitError = (err) => {
  console.log(err);
};

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: process.env.JWT_EXPIRES_IN_ADMIN,
  });
};

exports.signin = async (req, res) => {
  try {
    //console.log("Admin Signin");
    let admin = await users.findOne({
      number: !isNaN(req.body.admin_id) ? req.body.number : 1,
    });
    if (isEmpty(admin)) {
      admin = await users.findOne({ email: req.body.email });
    }
    if (!isEmpty(admin)) {
      const check = await bcrypt.compare(req.body.password, admin.password);
      if (check == true) {
        const token = signToken(admin._id);
        res.status(201).json({
          status: "success",
          message: "Sign In Success",
          token,
        });
      } else {
        res.status(203).json({
          status: "failed",
          message: "Password did not match",
        });
      }
    } else {
      res.status(203).json({
        status: "failed",
        message: "No user found",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internal Server Error",
    });
    exitError(err);
  }
};

exports.checkAdminToken = async (req, res, next) => {
  try {
    //console.log("Header ", req.headers);
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("gbdleathers")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    //console.log("Token is ", token);
    if (!token) {
      res.status(401).json({
        status: "error",
        message: "UnAuthorize access",
        error: err,
      });
    }
    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_ADMIN
    );

    req.body.id = decodedToken.id;
    next();
  } catch (err) {
    console.log("Admin Token Error");
    res.status(400).json({
      status: "error",
      message: "Internal Server Error",
      error: err,
    });
  }
};
