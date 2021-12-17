const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Users = require("../Models/userModel");
const Categorys = require("../Models/CategoryModel");
const Products = require("../Models/ProductModel");

const DB = "mongodb://localhost:27017/gbdleathers";

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("Database Connected");
  })
  .catch((err) => console.log("Error Connecting Database"));

const removeUsers = async () => {
  try {
    console.log("Users Removing...");
    await Users.deleteMany();
    console.log("Users Removed");
  } catch (err) {
    console.log(err);
  }
};

const removeCategorys = async () => {
  try {
    console.log("Categorys Removing...");
    await Categorys.deleteMany();
    console.log("Categorys Removed");
  } catch (err) {
    console.log(err);
  }
};
const removeProducts = async () => {
  try {
    console.log("Products Removing...");
    await Products.deleteMany();
    console.log("Products Removed");
  } catch (err) {
    console.log(err);
  }
};

// removeUsers();
removeCategorys();
// removeProducts();

// process.exit();
