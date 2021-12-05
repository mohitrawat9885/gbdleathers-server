const categorys = require("../Models/categoryModel");
const contactus = require("../Models/contactUsModel");
const crafts = require("../Models/craftModel");
const customers = require("../Models/customerModel");
const customProducts = require("../Models/customProductModel");
const newOrders = require("../Models/newOrderModel");
const participants = require("../Models/participantsModel");
// const users = require("../Models/userModel");
const workshops = require("../Models/workshopModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const exitError = (err) => {
  console.log(err);
};

exports.getAllCategorys = async (req, res) => {
  try {
    categorys.find({}, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "All Categorys fetched successfully",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Category Found",
          data: [],
        });
        res.end();
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

exports.getAllCrafts = async (req, res) => {
  try {
    crafts
      .find({}, (err, data) => {
        if (err) throw err;
        if (!isEmpty(data)) {
          res.status(200).json({
            status: "success",
            message: "All Crafts fetched successfully",
            data: data,
          });
          res.end();
        } else {
          res.status(200).json({
            status: "success",
            message: "No Craft Found",
            data: [],
          });
          res.end();
        }
      })
      .limit(req.body.craftLimit);
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.getCraft = async (req, res) => {
  try {
    crafts.findOne({ _id: req.body.craftId }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Craft fetched successfully",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Craft Found",
          data: {},
        });
        res.end();
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

exports.getCraftStock = (req, res) => {
  try {
    crafts.findOne({ _id: req.body.craftId }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Stock fetched successfully",
          data: data.quantity,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "Craft Not Found!",
          data: 0,
        });
        res.end();
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

exports.getAllCraftImages = async (req, res) => {
  try {
    crafts.findOne({ _id: req.body.craftId }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.send(data.image);
        res.status(200).json({
          status: "success",
          message: "Craft Images fetched successfully",
          data: data.image,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "Craft Not Found!",
          data: [],
        });
        res.end();
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

exports.getCategoryCraft = async (req, res) => {
  try {
    crafts.find({ category: req.body.craftCategory }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Crafts fetched successfully",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Craft Found with this category",
          data: [],
        });
        res.end();
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

exports.signUp = async (req, res) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    const find_customer = await customers.findOne({ number: req.body.number });

    if (!isEmpty(find_customer)) {
      res.status(208).json({
        status: "failed",
        reason: "numberAlreadyPresent",
        message: "User with same Number Already Present.",
      });
    } else {
      const saltRounds = 10;
      const hashed = bcrypt.hashSync(req.body.password, saltRounds);
      const newCustomer = new customers({
        name: req.body.name,
        number: req.body.number,
        email: "",
        password: hashed,
        address: { status: false },
      });

      newCustomer.save(() => {
        customers.findOne(
          { number: req.body.number, password: hashed },
          function (err, data) {
            if (err) throw err;
            if (!isEmpty(data)) {
              const token = signToken(data._id);
              res.status(200).json({
                status: "success",
                message: "User's Account has Created Successfully.",
                token: token,
              });
              res.end();
            } else {
              res.status(400).json({
                status: "failed",
                message: "Failed to create user account",
              });
              res.end();
            }
          }
        );
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    console.log("Signin");
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    const customer = await customers.findOne({ number: req.body.number });
    if (!isEmpty(customer)) {
      const check = await bcrypt.compare(req.body.password, customer.password);
      if (check == true) {
        const token = signToken(customer._id);
        res.status(201).json({
          status: "success",
          message: "Sign In Success",
          token,
        });
      } else {
        res.status(203).json({
          status: "failed",
          reason: "passwordNotMatch",
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

exports.resetPassword = async (req, res) => {
  try {
    req.body.number = String(req.body.number).replace(/[^0-9]/g, "");
    const customer = await customers.findOne({ number: req.body.number });

    if (isEmpty(customer)) {
      res.status(400).json({
        status: "failed",
        reason: "userNotFound",
        message: "User Not Found",
      });
    } else {
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
    }
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.addCusAddress = async (req, res) => {
  try {
    customers.updateOne(
      { _id: req.body.id },
      { $set: { address: req.body.address } },
      (err, re) => {
        if (err) throw err;
        console.log(re);
        res.status(200).json({
          status: "success",
          message: "Address Added Successfully",
        });
        res.end();
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

exports.address = async (req, res) => {
  try {
    customers.findOne({ _id: req.body.id }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Address Found",
          data: data.address,
        });
        res.end();
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
        res.end();
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

exports.checkOut = async (req, res) => {
  try {
    let address = {};
    customers.findOne({ _id: req.body.id }, (err, data) => {
      if (err) throw err;
      address = data.address;
      for (x in req.body.cus_order) {
        const newOrder = new newOrders({
          order_status: "Ordered",
          order_pay: "cod",
          customer_id: data._id,
          craft_name: req.body.cus_order[x].name,
          craft_image: req.body.cus_order[x].image_name,
          craft_price: req.body.cus_order[x].price,
          craft_category: req.body.cus_order[x].category,
          craft_quantity: req.body.cus_order[x].craft_qty,
          customer_address: address,
          order_date: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
          },
        });
        crafts.findOne(
          { _id: req.body.cus_order[x].craft_id },
          (err2, data2) => {
            if (err2) throw err2;
            crafts.updateOne(
              { _id: data2._id },
              {
                $set: {
                  quantity: data2.quantity - req.body.cus_order[x].craft_qty,
                },
              },
              (err7, data7) => {
                if (err7) throw err7;
              }
            );
          }
        );
        newOrder.save();
      }
      res.status(200).json({
        status: "success",
        message: "Order Placed",
      });
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.getMyOrdrs = async (req, res) => {
  try {
    newOrders.find({ customer_id: req.body.id }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Order fetched",
          data: data,
        });
      } else {
        res.status(200).json({
          status: "success",
          message: "No Order Found",
          data: [],
        });
      }
      res.end();
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.getAllWorkshops = async (req, res) => {
  try {
    workshops.find({}, (err, data) => {
      if (err) throw err;

      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "All Workshops fetched",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No workshop Found",
          data: [],
        });
        res.end();
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
exports.getAllPublishedWorkshops_date = async (req, res) => {
  try {
    workshops.find({ published: true }, (err, data) => {
      if (err) throw err;
      var date = new Date();
      if (!isEmpty(data)) {
        let x;
        let newData = [];
        let indi = 0;
        if (req.body.time === "upcoming") {
          for (x in data) {
            if (data[x].workshop_time.year < date.getFullYear()) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month < date.getMonth()
            ) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month === date.getMonth() &&
              data[x].workshop_time.day < date.getDate()
            ) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month === date.getMonth() &&
              data[x].workshop_time.day === date.getDate() &&
              data[x].workshop_time.endHour < date.getHours()
            ) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month === date.getMonth() &&
              data[x].workshop_time.day === date.getDate() &&
              data[x].workshop_time.endHour === date.getHours() &&
              data[x].workshop_time.endMinute < date.getMinutes()
            ) {
              delete data[x];
            } else {
              newData[indi] = data[x];
              indi++;
            }
          }
        } else if (req.body.time === "accomplished") {
          for (x in data) {
            if (data[x].workshop_time.year > date.getFullYear()) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month > date.getMonth()
            ) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month === date.getMonth() &&
              data[x].workshop_time.day > date.getDate()
            ) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month === date.getMonth() &&
              data[x].workshop_time.day === date.getDate() &&
              data[x].workshop_time.endHour > date.getHours()
            ) {
              delete data[x];
            } else if (
              data[x].workshop_time.year === date.getFullYear() &&
              data[x].workshop_time.month === date.getMonth() &&
              data[x].workshop_time.day === date.getDate() &&
              data[x].workshop_time.endHour === date.getHours() &&
              data[x].workshop_time.endMinute > date.getMinutes()
            ) {
              delete data[x];
            } else {
              newData[indi] = data[x];
              indi++;
            }
          }
        }
        if (!isEmpty(newData)) {
          res.status(200).json({
            status: "success",
            message: "Workshops fetched",
            data: newData,
          });
        } else {
          res.status(200).json({
            status: "success",
            message: "No Workshops Found",
            data: [],
          });
        }

        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Workshops Found",
          data: [],
        });
        res.end();
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

exports.getAllPublishedWorkshops = (req, res) => {
  try {
    workshops.find({ published: true }, (err, data) => {
      if (err) throw err;

      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Workshops fetched",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Workshops Found",
          data: [],
        });
        res.end();
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
exports.getWorkshop = (req, res) => {
  try {
    workshops.find({ _id: req.body.workshop_id }, (err, data) => {
      if (err) throw err;

      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Workshops fetched",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Workshops Found",
          data: [],
        });
        res.end();
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

exports.getWorkshopImages = async (req, res) => {
  try {
    workshops.find({ _id: req.body.workshop_id }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Workshop Images Fetched",
          data: data.banner,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Workshop Images Found",
          data: [],
        });
        res.end();
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

exports.getAllWorkshopImages = (req, res) => {
  try {
    workshops.findOne({ _id: req.body.workshopId }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Workshop Images Fetched",
          data: data.banner,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Workshop Images Found",
          data: [],
        });
        res.end();
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

exports.workshopRegistration = (req, res) => {
  try {
    workshops.findOne({ _id: req.body.workshop_id }, (err2, data2) => {
      if (err2) throw err2;
      participants.find(
        { workshop_id: req.body.workshop_id },
        (err1, data1) => {
          if (err1) throw err;
          if (data1.length >= data2.workshop_limit) {
            res.send({ status: "out_of_limit" });
          } else {
            customers.findOne({ _id: req.body.participant_id }, (err, data) => {
              if (err) throw err;
              if (!isEmpty(data)) {
                const newParticipant = new participants({
                  workshop_id: req.body.workshop_id,
                  participant_id: req.body.participant_id,
                  name: req.body.participant_name,
                  number: data.number,
                  participant_time: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    date: date.getDate(),
                    hour: date.getHours(),
                    minute: date.getMinutes(),
                  },
                });
                newParticipant.save();
                workshops.updateOne(
                  { _id: req.body.workshop_id },
                  {
                    $set: {
                      workshop_available:
                        data2.workshop_limit - data1.length - 1,
                    },
                  },
                  (err6, data6) => {
                    if (err6) throw err6;
                  }
                );
                res.status(200).json({
                  status: "success",
                  message: "Registered",
                });
              } else {
                res.status(401).json({
                  status: "failed",
                  message: "Registration Failed",
                });
              }
            });
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

exports.uploadCustomProduct = (req, res) => {
  try {
    req.body.customer_number = String(req.body.customer_number).replace(
      /[^0-9]/g,
      ""
    );
    let imageName =
      String(req.body.custom_product_name).replace(/[^a-z||A-Z]/g, "") +
      date.getFullYear() +
      date.getMonth() +
      date.getDay() +
      date.getHours() +
      date.getMinutes() +
      date.getSeconds() +
      Math.floor(Math.random() * 10000);

    var x;
    var imageNames = [];

    for (x in req.body.custom_product_images) {
      imageNames[x] = x + imageName + ".jpeg";
    }
    const newCustomProduct = new customProducts({
      custom_product_images: imageNames,
      custom_product_name: req.body.custom_product_name,
      custom_product_description: req.body.custom_product_description,
      customer_full_name: req.body.customer_full_name,
      customer_number: req.body.customer_number,
      requested_at: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
      },
    });

    newCustomProduct.save((err) => {
      if (err) throw err;
      for (x in req.body.custom_product_images) {
        req.body.custom_product_images[x] = req.body.custom_product_images[
          x
        ].replace(/^data:image\/[a-z]+;base64,/, "");
        fs.writeFile(
          "./gbdhandwork/build/assets/customProducts/" +
            x +
            imageName +
            ".jpeg",
          req.body.custom_product_images[x],
          "base64",
          (err2) => {
            if (err2) throw err2;
          }
        );
      }
    });
    res.status(200).json({
      status: "success",
      message: "Product Saves",
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.contactUsSubmit = (req, res) => {
  try {
    //console.log(req.body);

    const newContactUs = new contactus({
      name: req.body.name,
      number: req.body.number,
      email: req.body.email,
      message: req.body.message,
      contacted_at: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
      },
    });

    newContactUs.save((err) => {
      if (err) throw err;
      res.status(200).json({
        status: "success",
        message: "Submitted",
      });
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};
