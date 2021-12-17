const express = require("express");
// const AdminFunctions = require("../Functions/Admin/AdminFunctions");
const ShopFunctions = require("../Functions/Admin/ShopFunctions");
const AdminAuthentication = require("../Functions/Admin/AdminAuthentication");
const Functions = require("../Functions/Admin/Functions");
const { route } = require("express/lib/application");
const router = express.Router();

router.route("/signin").post(AdminAuthentication.signin);

//   End Of ---   Sign In Seller -------------------------------

router
  .route("/uploadimage")
  .post(AdminAuthentication.checkAdminToken, Functions.uploadImage);

router
  .route("/createcategory")
  .post(AdminAuthentication.checkAdminToken, ShopFunctions.createCategory);

router
  .route("/createproduct")
  .post(AdminAuthentication.checkAdminToken, ShopFunctions.createProduct);

router
  .route("/getallcategorys")
  .get(AdminAuthentication.checkAdminToken, ShopFunctions.getAllCategorys);

router
  .route("/getcategoryproductlist")
  .get(
    AdminAuthentication.checkAdminToken,
    ShopFunctions.getCategoryProductlist
  );

router
  .route("/updatecategory")
  .put(AdminAuthentication.checkAdminToken, ShopFunctions.updateCategory);
router
  .route("/updateproduct")
  .put(AdminAuthentication.checkAdminToken, ShopFunctions.updateProduct);

router
  .route("/getproductbyid")
  .get(AdminAuthentication.checkAdminToken, ShopFunctions.getProductById);

router
  .route("/getcategorybyid")
  .get(AdminAuthentication.checkAdminToken, ShopFunctions.getCategoryById);
// ------------Ok----------------------------------------------------------------------------------------

// router
//   .route("/getallorders")
//   .get(AdminAuthentication.checkAdminToken, ShopFunctions.getAllOrders);

// router
//   .route("/alterorder")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.alterOrder);

// // Adding New Craft//

// router
//   .route("/addcraft")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.addCraft);

// router
//   .route("/updatecraft")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.updateCraft);
// router
//   .route("/addcraftimage")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.addCraftImage);

// router
//   .route("/removecraftimage")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.removeCraftImage);

// router
//   .route("/removecraft")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.removeCraft);

// //Send All Categorys
// router
//   .route("/getallcategorys")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getAllCategorys);
// //Send All Crafts
// router
//   .route("/getallcrafts")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getAllCrafts);

// router
//   .route("/getcraft")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getCraft);

// router
//   .route("/getcraftStock")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getCraftStock);

// router
//   .route("/getallcraftImages")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getAllCraftImages);

// router
//   .route("/getcategorycraft")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getCategoryCraft);
// // Add New Category by Admin

// router
//   .route("/removecategory")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.removeCategory);

// router
//   .route("/addWorkshop")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.addWorkshop);

// router
//   .route("/getallworkshops")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getAllWorkshops);
// router
//   .route("/getallpublishedworkshops_date")
//   .post(
//     AdminAuthentication.checkAdminToken,
//     AdminFunctions.getAllPublishedWorkshops_date
//   );

// router
//   .route("/getallpublishedworkshops")
//   .post(
//     AdminAuthentication.checkAdminToken,
//     AdminFunctions.getAllPublishedWorkshops
//   );
// router
//   .route("/getworkshop")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getWorkshop);

// router
//   .route("/getworkshopImages")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getWorkshopImages);

// router
//   .route("/updateworkshop")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.updateWorkshop);
// router
//   .route("/getallworkshopimages")
//   .post(
//     AdminAuthentication.checkAdminToken,
//     AdminFunctions.getAllWorkshopImages
//   );

// router
//   .route("/addworkshopimage")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.addWorkshopImage);

// router
//   .route("/removeworkshopimage")
//   .post(
//     AdminAuthentication.checkAdminToken,
//     AdminFunctions.removeWorkshopImage
//   );

// router
//   .route("/removeworkshop")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.removeWorkshop);

// router
//   .route("/getallparticipants")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getAllParticipants);

// router
//   .route("/getallcustomorders")
//   .post(AdminAuthentication.checkAdminToken, AdminFunctions.getAllCustomOrders);

// router
//   .route("/getallguestcontacts")
//   .post(
//     AdminAuthentication.checkAdminToken,
//     AdminFunctions.getAllGuestContacts
//   );

module.exports = router;
