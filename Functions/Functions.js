const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.checkToken = async (req, res, next) => {
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
      process.env.JWT_SECRET
    );

    req.body.id = decodedToken.id;
    next();
  } catch (err) {
    console.log("Token Error");
    res.status(400).json({
      status: "error",
      message: "Internal Server Error",
      error: err,
    });
  }
};
