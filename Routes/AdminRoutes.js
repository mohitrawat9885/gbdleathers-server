const express = require("express");
const AdminFunctions = require("../Functions/AdminFunctions");
const Functions = require("../Functions/Functions");
const router = express.Router();

router.route("/signin").post(AdminFunctions.signin);

//   End Of ---   Sign In Seller -------------------------------

router
  .route("/getallorders")
  .get(Functions.checkToken, AdminFunctions.getAllOrders);

router
  .route("/alterorder")
  .post(Functions.checkToken, AdminFunctions.alterOrder);

// Adding New Craft//

router.route("/addcraft").post(Functions.checkToken, AdminFunctions.addCraft);

router
  .route("/updatecraft")
  .post(Functions.checkToken, AdminFunctions.updateCraft);
router
  .route("/addcraftimage")
  .post(Functions.checkToken, AdminFunctions.addCraftImage);

router
  .route("/removecraftimage")
  .post(Functions.checkToken, AdminFunctions.removeCraftImage);

router
  .route("/removecraft")
  .post(Functions.checkToken, AdminFunctions.removeCraft);

//Send All Categorys
router
  .route("/getallcategorys")
  .post(Functions.checkToken, AdminFunctions.getAllCategorys);
//Send All Crafts
router
  .route("/getallcrafts")
  .post(Functions.checkToken, AdminFunctions.getAllCrafts);

router.route("/getcraft").post(Functions.checkToken, AdminFunctions.getCraft);

router
  .route("/getcraftStock")
  .post(Functions.checkToken, AdminFunctions.getCraftStock);

router
  .route("/getallcraftImages")
  .post(Functions.checkToken, AdminFunctions.getAllCraftImages);

router
  .route("/getcategorycraft")
  .post(Functions.checkToken, AdminFunctions.getCategoryCraft);
// Add New Category by Admin
router
  .route("/addcategory")
  .post(Functions.checkToken, AdminFunctions.addCategory);

router
  .route("/removecategory")
  .post(Functions.checkToken, AdminFunctions.removeCategory);

router
  .route("/addWorkshop")
  .post(Functions.checkToken, AdminFunctions.addWorkshop);

router
  .route("/getallworkshops")
  .post(Functions.checkToken, AdminFunctions.getAllWorkshops);
router
  .route("/getallpublishedworkshops_date")
  .post(Functions.checkToken, AdminFunctions.getAllPublishedWorkshops_date);

router
  .route("/getallpublishedworkshops")
  .post(Functions.checkToken, AdminFunctions.getAllPublishedWorkshops);
router
  .route("/getworkshop")
  .post(Functions.checkToken, AdminFunctions.getWorkshop);

router
  .route("/getworkshopImages")
  .post(Functions.checkToken, AdminFunctions.getWorkshopImages);

router
  .route("/updateworkshop")
  .post(Functions.checkToken, AdminFunctions.updateWorkshop);
router
  .route("/getallworkshopimages")
  .post(Functions.checkToken, AdminFunctions.getAllWorkshopImages);

router
  .route("/addworkshopimage")
  .post(Functions.checkToken, AdminFunctions.addWorkshopImage);

router
  .route("/removeworkshopimage")
  .post(Functions.checkToken, AdminFunctions.removeWorkshopImage);

router
  .route("/removeworkshop")
  .post(Functions.checkToken, AdminFunctions.removeWorkshop);

router
  .route("/getallparticipants")
  .post(Functions.checkToken, AdminFunctions.getAllParticipants);

router
  .route("/getallcustomorders")
  .post(Functions.checkToken, AdminFunctions.getAllCustomOrders);

router
  .route("/getallguestcontacts")
  .post(Functions.checkToken, AdminFunctions.getAllGuestContacts);

module.exports = router;
