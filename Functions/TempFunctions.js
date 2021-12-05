//***************** */ This are Temrary Functions. **************************]

exports.signUp = async (req, res) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    //const find_customer = customers.findOne({ number: req.body.number }
    customers.findOne({ number: req.body.number }, function (err, data) {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.send({ warning: "number_present" });
      } else if (!isEmpty(req.body.email)) {
        customers.findOne({ email: req.body.email }, function (err2, data2) {
          if (err2) throw err2;
          if (!isEmpty(data2)) {
            res.send({ warning: "email_present" });
          } else {
            checkNumber();
          }
        });
      } else {
        checkNumber();
      }
    });

    const checkNumber = () => {
      client.verify
        .services(config.serviceID)
        .verifications.create({
          to: `+${req.body.number}`,
          channel: "sms",
        })
        .then((data) => {
          res.send({ status: "enter_otp" });
        });
    };
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.beforeSignUpOtp = async (req, res, next) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    client.verify
      .services(config.serviceID)
      .verificationChecks.create({
        to: `+${req.body.number}`,
        code: req.body.myOtp,
      })
      .then((data) => {
        if (data.valid === true) {
          next();
        } else {
          res.send({ warning: "wrong_otp" });
        }
      });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.signUpOtp = (req, res) => {
  try {
    const hashed = bcrypt.hashSync(req.body.password, saltRounds);
    const newCustomer = new customers({
      name: req.body.name,
      number: req.body.number,
      email: req.body.email,
      password: hashed,
      address: { status: false },
    });

    newCustomer.save(() => {
      customers.findOne(
        { number: req.body.number, password: hashed },
        function (err, data) {
          if (err) throw err;
          if (!isEmpty(data)) {
            var session = {
              status: "ok",
              id: data._id,
              name: data.name,
              number: data.number,
              email: data.email,
              // Cus_bag: data.Cus_bag
            };
            res.send(session);
            res.end();
          } else {
            res.send({ warning: "failed_to_signUp" });
            res.end();
          }
        }
      );
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.resetPasswordOTP = async (req, res) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    customers.findOne({ number: req.body.number }, function (err, data) {
      if (err) throw err;
      if (!isEmpty(data)) {
        checkNumber();
      } else {
        res.send({ warning: "number_not_present" });
      }
    });

    const checkNumber = () => {
      client.verify
        .services(config.serviceID)
        .verifications.create({
          to: `+${req.body.number}`,
          channel: "sms",
        })
        .then((data) => {
          res.send({ status: "enter_otp" });
        });
    };
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.resetPasswordCheck = async (req, res) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    client.verify
      .services(config.serviceID)
      .verificationChecks.create({
        to: `+${req.body.number}`,
        code: req.body.myOtp,
      })
      .then((data) => {
        if (data.valid === true) {
          res.send({ status: "ok" });
        } else {
          res.send({ warning: "wrong_otp" });
        }
      });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.nowResetPassword = async (req, res) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    const hashed = bcrypt.hashSync(req.body.newPassword, saltRounds);
    customers.updateOne(
      { number: req.body.number },
      { $set: { password: hashed } },
      (err, re) => {
        if (err) throw err;

        if (re.nModified === 1) {
          res.send({ status: "password_set" });
        } else {
          res.send({ warning: "password_not_set" });
        }
      }
    );
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};
