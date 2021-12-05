const fs = require("fs");

const categorys = require("../Models/categoryModel");
const contactus = require("../Models/contactUsModel");
const crafts = require("../Models/craftModel");
const customers = require("../Models/customerModel");
const customProducts = require("../Models/customProductModel");
const newOrders = require("../Models/newOrderModel");
const participants = require("../Models/participantsModel");
const users = require("../Models/userModel");
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
    expiresIn: process.env.JWT_EXPIRES_IN_ADMIN,
  });
};

const exitError = (err) => {
  console.log(err);
};

////////  Admin signin
exports.signin = async (req, res) => {
  try {
    //console.log("Admin Signin");
    let admin = await users.findOne({
      number: !isNaN(req.body.admin_id) ? req.body.admin_id : 1,
    });
    if (isEmpty(admin)) {
      admin = await users.findOne({ email: req.body.admin_id });
    }

    if (!isEmpty(admin)) {
      const check = await bcrypt.compare(req.body.password, admin.password);
      // console.log(check);
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

exports.getAllOrders = async (req, res) => {
  try {
    const admin = await users.findOne({ _id: req.body.id, role: "admin" });
    if (!isEmpty(admin)) {
      let neworders = newOrders.find({ order_status: req.body.order_status });
      if (isEmpty(neworders)) {
        neworders = [];
      }
      res.status(200).json({
        status: "success",
        message: "All Orders fetched",
        data: neworders,
      });
    } else {
      res.status(401).json({
        status: "failed",
        message: "unauthorized access",
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

exports.alterOrder = async (req, res) => {
  try {
    const admin = users.findOne({ _id: req.body.id, role: "admin" });
    if (!isEmpty(admin)) {
      newOrders.updateOne(
        { _id: req.body.order_id },
        { $set: { order_status: req.body.order_status } },
        (err, re) => {
          if (err) throw err;
          if (re.nModified >= 1) {
            res
              .status(201)
              .json({ status: "success", message: "Order updated" });
          } else {
            res
              .status(400)
              .json({ status: "failed", message: "Order not changed" });
          }
        }
      );
    } else {
      res.status(401).json({
        status: "failed",
        message: "unauthorized access",
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

exports.addCraft = async (req, res) => {
  try {
    req.body.image_name = String(req.body.image_name).replace(/\s/g, "");
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        const newCraft = new crafts({
          admin_id: req.body.id,
          name: req.body.name,
          price: req.body.price,
          quantity: 0,
          image: [req.body.image_name],
          sort_detail: req.body.sort_detail,
          long_detail: req.body.long_detail,
          category: req.body.category,
        });
        newCraft.save();

        fs.writeFile(
          "./gbdleathers/build/assets/crafts/" + req.body.image_name + "",
          req.body.image_data,
          "base64",
          (err) => {
            if (err) throw err;
          }
        );
        res.status(200).json({
          status: "success",
          message: "Craft Added",
        });
        res.end();
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.updateCraft = async (req, res) => {
  try {
    console.log("Updating...");
    req.body.image_name = String(req.body.image_name).replace(/\s/g, "");
    let images = [];
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        crafts.findOne({ _id: req.body.craft_id }, (err5, data5) => {
          if (err5) throw err5;
          images = data5.image;
          images[0] = req.body.image_name;
          const updateCraft = {
            admin_id: req.body.id,
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: images,
            sort_detail: req.body.sort_detail,
            long_detail: req.body.long_detail,
            category: req.body.category,
          };
          if (req.body.image_data) {
            fs.writeFile(
              "./gbdleathers/build/assets/crafts/" + req.body.image_name + "",
              req.body.image_data,
              "base64",
              (err) => {
                if (err) throw err;
              }
            );

            crafts.updateOne(
              { _id: req.body.craft_id },
              { $set: updateCraft },
              (err, re) => {
                if (err) throw err;
                if (re.modifiedCount) {
                  res
                    .status(200)
                    .json({ status: "success", message: "Updated" });
                  res.end();
                } else {
                  res
                    .status(400)
                    .json({ status: "failed", message: "Update failed" });
                  res.end();
                }
              }
            );
          } else {
            crafts.updateOne(
              { _id: req.body.craft_id },
              { $set: updateCraft },
              (err, re) => {
                if (err) throw err;
                if (re.modifiedCount) {
                  res
                    .status(201)
                    .json({ status: "success", message: "Updated" });
                  res.end();
                } else {
                  res
                    .status(400)
                    .json({ status: "failed", message: "update failed" });
                  res.end();
                }
              }
            );
          }
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.addCraftImage = async (req, res) => {
  try {
    req.body.image_name[req.body.imgIndex] = String(
      req.body.image_name[req.body.imgIndex]
    ).replace(/\s/g, "");
    console.log(req.body.image_name);
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        crafts.updateOne(
          { _id: req.body.craftId },
          { $set: { image: req.body.image_name } },
          (err, re) => {
            if (err) throw err;
            fs.writeFile(
              "./gbdleathers/build/assets/crafts/" +
                req.body.image_name[req.body.imgIndex] +
                "",
              req.body.image_data,
              "base64",
              (err2) => {
                if (err2) throw err2;
              }
            );
            res.status(201).json({ status: "success", message: "Added" });
            res.end();
          }
        );
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.removeCraftImage = async (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        crafts.updateOne(
          { _id: req.body.craftId },
          { $set: { image: req.body.image_name } },
          (err, re) => {
            if (err) throw err;
            res.status(200).json({ status: "success", message: "Removed" });
            res.end();
          }
        );
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.removeCraft = async (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        crafts.find({ _id: req.body.craft_id }).deleteOne((err, doc) => {
          if (err) throw err;
          res.status(200).json({ status: "success", message: "Deleted" });
          res.end();
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.getAllCategorys = async (req, res) => {
  try {
    categorys.find({}, (err, data) => {
      if (err) throw err;

      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "All Categorys Fetched",
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
            message: "All Crafts Fetched",
            data: data,
          });
          res.end();
        } else {
          res.status(200).json({
            status: "success",
            message: "No Crafts Available",
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
          message: "Craft Found",
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
          message: "Craft Quantity Fetched",
          data: data.quantity,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "Craft Quantity Fetched",
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
        res.status(200).json({
          status: "success",
          message: "Images Fetched Successfully",
          data: data.image,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Images Found",
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
          message: "Category Craft Fetched Successfully",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Category Craft Found",
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

exports.addCategory = async (req, res) => {
  try {
    req.body.image_name = String(req.body.image_name).replace(/\s/g, "");
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        const newCategory = new categorys({
          admin_id: req.body.id,
          category: req.body.categoryName,
          image_name: req.body.image_name,
        });

        newCategory.save();
        fs.writeFile(
          "./gbdleathers/build/assets/categorys/" + req.body.image_name + "",
          req.body.image_data,
          "base64",
          (err) => {
            if (err) throw err;
          }
        );
        res.status(200).json({ status: "success", message: "Addeded" });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.removeCategory = async (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        categorys.find({ _id: req.body.category_id }).deleteOne((err, doc) => {
          if (err) throw err;
          res.status(200).json({ status: "success", message: "Removed" });
          res.end();
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.addWorkshop = async (req, res) => {
  try {
    req.body.banner = String(req.body.banner).replace(/\s/g, "");
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        const newWorkshop = new workshops({
          admin_id: req.body.id,
          banner: [req.body.banner],
          workshop_name: req.body.workshop_name,
          workshop_time: req.body.workshop_time,
          registration_fee: req.body.registration_fee,
          workshop_detail: req.body.workshop_detail,
          workshop_limit: req.body.workshop_limit,
          workshop_available: req.body.workshop_limit,
          workshop_location: "",
          published: false,
        });

        newWorkshop.save();
        fs.writeFile(
          "./gbdleathers/build/assets/workshops/" + req.body.banner + "",
          req.body.bannerData,
          "base64",
          (err) => {
            if (err) throw err;
          }
        );
        res.status(200).json({ status: "success", message: "Added" });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.getAllWorkshops = async (req, res) => {
  try {
    workshops.find({}, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        res.status(200).json({
          status: "success",
          message: "Workshops fetched successfully",
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
exports.getAllPublishedWorkshops_date = async (req, res) => {
  try {
    workshops.find({ published: true }, (err, data) => {
      if (err) throw err;

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
            message: "Workshops Fetched Successfully",
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
          message: "Workshops Fetched successfully",
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
          message: "Workshop fetched successfully",
          data: data,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Workshop Found",
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
          message: "Images Fetched",
          data: data.banner,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Image Found",
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

exports.updateWorkshop = (req, res) => {
  try {
    console.log("Updating... Workshop");
    req.body.banner = String(req.body.banner).replace(/\s/g, "");
    let banners = [];
    let available_workshop;
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        workshops.findOne({ _id: req.body.workshop_id }, (err5, data5) => {
          if (err5) throw data5;
          banners = data5.banner;
          banners[0] = req.body.banner;
          participants.find(
            { workshop_id: req.body.workshop_id },
            (err1, data1) => {
              if (err1) throw err;
              available_workshop = req.body.workshop_limit - data1.length;
              const updateWorkshop = {
                admin_id: req.body.id,
                banner: banners,
                workshop_name: req.body.workshop_name,
                workshop_time: req.body.workshop_time,
                registration_fee: req.body.registration_fee,
                workshop_detail: req.body.workshop_detail,
                workshop_limit: req.body.workshop_limit,
                workshop_available: available_workshop,
                workshop_location: req.body.workshop_location,
                published: req.body.published,
              };
              if (req.body.bannerData) {
                fs.writeFile(
                  "./gbdleathers/build/assets/workshops/" +
                    req.body.banner +
                    "",
                  req.body.bannerData,
                  "base64",
                  (err) => {
                    if (err) throw err;
                    else {
                      workshops.updateOne(
                        { _id: req.body.workshop_id },
                        { $set: updateWorkshop },
                        (err, re) => {
                          if (err) throw err;

                          if (re.modifiedCount) {
                            res
                              .status(200)
                              .json({ status: "success", message: "Updated" });
                            res.end();
                          } else {
                            res.status(401).json({
                              status: "failed",
                              message: "Failed to update",
                            });
                            res.end();
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                workshops.updateOne(
                  { _id: req.body.workshop_id },
                  { $set: updateWorkshop },
                  (err, re) => {
                    if (err) throw err;
                    //console.log("Uploading Status", re);
                    if (re.modifiedCount) {
                      res
                        .status(200)
                        .json({ status: "success", message: "Updated" });
                      res.end();
                    } else {
                      res.status(401).json({
                        status: "failed",
                        message: "failed to update",
                      });
                      res.end();
                    }
                  }
                );
              }
            }
          );
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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
          message: "Images Fetched",
          data: data.banner,
        });
        res.end();
      } else {
        res.status(200).json({
          status: "success",
          message: "No Images Found",
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

exports.addWorkshopImage = (req, res) => {
  try {
    //console.log(req.body.image_data);
    req.body.image_name[req.body.imgIndex] = String(
      req.body.image_name[req.body.imgIndex]
    ).replace(/\s/g, "");
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        workshops.updateOne(
          { _id: req.body.workshopId },
          { $set: { banner: req.body.image_name } },
          (err, re) => {
            if (err) throw err;
            fs.writeFile(
              "./gbdleathers/build/assets/workshops/" +
                req.body.image_name[req.body.imgIndex] +
                "",
              req.body.image_data,
              "base64",
              (err2) => {
                if (err2) throw err2;
              }
            );
            res.status(200).json({ status: "success", message: "added" });
            res.end();
          }
        );
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.removeWorkshopImage = (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        workshops.updateOne(
          { _id: req.body.workshopId },
          { $set: { banner: req.body.image_name } },
          (err, re) => {
            if (err) throw err;
            res.status(200).json({ status: "success", message: "Removed" });
            res.end();
          }
        );
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.removeWorkshop = (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        workshops.find({ _id: req.body.workshop_id }).deleteOne((err, doc) => {
          if (err) throw err;

          res.status(200).json({ status: "success", message: "Romoved" });
          res.end();
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.getAllParticipants = (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        participants.find(
          { workshop_id: req.body.workshop_id },
          (err2, data2) => {
            if (err2) throw err2;
            if (!isEmpty(data2)) {
              res.status(200).json({
                status: "success",
                message: "All Participants Fetched",
                data: data2,
              });
            } else {
              res.status(200).json({
                status: "success",
                message: "No Participants Found",
                data: [],
              });
            }
          }
        );
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.getAllCustomOrders = (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        customProducts.find({}, (err2, data2) => {
          if (err2) throw err2;
          if (!isEmpty(data2)) {
            res.status(200).json({
              status: "success",
              message: "All Custom Orders Fetched",
              data: data2,
            });
          } else {
            res.status(200).json({
              status: "success",
              message: "No Custom Order Found",
              data: [],
            });
          }
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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

exports.getAllGuestContacts = (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        contactus.find({}, (err2, data2) => {
          if (err2) throw err2;
          if (!isEmpty(data2)) {
            res.status(200).json({
              status: "success",
              message: "All Guest Contacts Fetched",
              data: data2,
            });
          } else {
            res.status(200).json({
              status: "success",
              message: "No Guest Contacts Found",
              data: [],
            });
          }
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "unauthorized access",
        });
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
