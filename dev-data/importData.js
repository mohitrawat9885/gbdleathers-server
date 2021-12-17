const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Users = require("../Models/userModel");
const Categorys = require("../Models/CategoryModel");
const Products = require("../Models/ProductModel");

const DB = "mongodb://localhost:27017/gbdleathers";

mongoose
  .connect(DB, {
    // useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log(con.connection)
    console.log("Database Connected");
  })
  .catch((err) => console.log("Error Connecting Database"));

const UsersData = JSON.parse(fs.readFileSync(`${__dirname}/Data/users.json`));

const importUsers = async () => {
  try {
    console.log("Data Loading...");
    await Users.create(UsersData);
    console.log("Data Loaded");
  } catch (err) {
    console.log(err);
  }
};

const CategorysData = JSON.parse(
  fs.readFileSync(`${__dirname}/Data/categorys.json`)
);
const importCategorys = async () => {
  try {
    console.log("Categorys Loading...");
    await Categorys.create(CategorysData);
    console.log("Categorys Loaded");
  } catch (err) {
    console.log(err);
  }
};

const ProductsData = JSON.parse(
  fs.readFileSync(`${__dirname}/Data/products.json`)
);
const importProducts = async () => {
  try {
    console.log("Products Loading...");
    await Products.create(ProductsData);
    console.log("Products Loaded");
  } catch (err) {
    console.log(err);
  }
};

// importUsers();
importCategorys();
// importProducts();
