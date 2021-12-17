const url = require("url");
const users = require("../../Models/userModel");
const Categorys = require("../../Models/CategoryModel");
const Products = require("../../Models/ProductModel");
const query = require("express/lib/middleware/query");

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

exports.createCategory = async (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        const newCategory = new Categorys({
          admin_id: req.body.id,
          name: req.body.name,
          image: req.body.image,
        });
        newCategory.save();
        // console.log(newCategory);
        res
          .status(200)
          .json({ status: "success", message: "A new Category has added." });
      } else {
        res.status(401).json({
          status: "failed",
          message: "Unauthorized access",
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.getAllCategorys = async (req, res) => {
  try {
    const data = await Categorys.find({});
    // console.log(req.body.id);
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
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    users.findOne({ _id: req.body.id, role: "admin" }, (err, data) => {
      if (err) throw err;
      if (!isEmpty(data)) {
        const newProduct = new Products({
          admin_id: req.body.id,
          name: req.body.name,
          price: req.body.price,
          image: [req.body.image],
          sort_detail: req.body.sort_detail,
          long_detail: req.body.long_detail,
          category: req.body.category,
        });
        newProduct.save();
        res.status(200).json({
          status: "success",
          message: "New Product created successfully.",
        });
        res.end();
      } else {
        res.status(401).json({
          status: "failed",
          message: "Unauthorized access",
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const queryObject = url.parse(req.url, true).query;

    queryObject.productId = queryObject.productId.toString();
    const admin = await users.findOne({ _id: req.body.id });
    if (isEmpty(admin)) {
      res.status(404).json({
        status: "failed",
        message: "Admin not found",
      });
      return;
    }
    const product = await Products.findOne({ _id: queryObject.productId });
    res.status(200).json({
      status: "success",
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const queryObject = url.parse(req.url, true).query;

    queryObject.categoryId = queryObject.categoryId.toString();

    const admin = await users.findOne({ _id: req.body.id });
    if (isEmpty(admin)) {
      res.status(404).json({
        status: "failed",
        message: "Admin not found",
      });
      return;
    }
    const category = await Categorys.findOne({ _id: queryObject.categoryId });
    res.status(200).json({
      status: "success",
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

// exports.getAllCategorys = async (req, res) => {
//   try {
//     categorys.find({}, (err, data) => {
//       if (err) throw err;
//       if (!isEmpty(data)) {
//         res.status(200).json({
//           status: "success",
//           message: "All Categorys Fetched",
//           data: data,
//         });
//         res.end();
//       } else {
//         res.status(200).json({
//           status: "success",
//           message: "No Category Found",
//           data: [],
//         });
//         res.end();
//       }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "Error",
//       message: "Internel Server Error",
//       error: err,
//     });
//   }
// };

exports.getCategoryProductlist = async (req, res) => {
  try {
    let categorys = await Categorys.find({});
    if (isEmpty(categorys)) {
      res.status(200).json({
        status: "success",
        message: "No Category found",
        data: [],
      });
      return;
    }

    let list = [];
    for (i in categorys) {
      let product = await Products.find({ category: categorys[i]._id });
      list[i] = {
        _id: categorys[i]._id,
        name: categorys[i].name,
        image: categorys[i].image,
        products: product,
      };
    }
    res.status(200).json({
      status: "success",
      message: "Category with Products fetched successfully",
      data: list,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      message: "Internel Server Error",
      error: err,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const admin = await users.findOne({ _id: req.body.id });
    if (isEmpty(admin)) {
      res.status(404).json({
        status: "failed",
        message: "Admin not found",
      });
      return;
    }
    // console.log(req.body);
    let date = new Date();
    const ret = await Categorys.updateOne(
      { _id: req.body.category_id },
      { $set: { name: req.body.name, image: req.body.image, updated_at: date } }
    );

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      // error: err,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const admin = await users.findOne({ _id: req.body.id });
    if (isEmpty(admin)) {
      res.status(404).json({
        status: "failed",
        message: "Admin not found",
      });
      return;
    }
    console.log(req.body);
    let date = new Date();
    const updatedProduct = {
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      published: req.body.published,
      image: [req.body.image],
      sort_detail: req.body.sort_detail,
      long_detail: req.body.long_detail,
      category: req.body.category,
      updated_at: date,
    };

    const ret = await Products.updateOne(
      { _id: req.body.product_id },
      { $set: updatedProduct }
    );
    console.log(ret);
    res.status(200).json({
      status: "success",
      message: "Product  updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Internel Server Error",
      error: err,
    });
  }
};
