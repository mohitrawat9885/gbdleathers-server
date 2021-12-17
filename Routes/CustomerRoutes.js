const express = require("express");
const CustomerFunctions = require("../Functions/Client/CustomerFunctions");
const ClientAuthentication = require("../Functions/Client/ClientAuthentication");
const router = express.Router();

//Send All Categorys
router.route("/getallcategorys").post(CustomerFunctions.getAllCategorys);
//Send All Crafts
router.route("/getallcrafts").post(CustomerFunctions.getAllCrafts);

router.route("/getcraft").post(CustomerFunctions.getCraft);

router.route("/getcraftstock").post(CustomerFunctions.getCraftStock);

router.route("/getallcraftimages").post(CustomerFunctions.getAllCraftImages);

router.route("/getcategorycraft").post(CustomerFunctions.getCategoryCraft);
// Add New Category by Admin

router.route("/signin").post(CustomerFunctions.signIn);

router.route("/signup").post(CustomerFunctions.signUp);

router.route("/resetpassword").post(CustomerFunctions.resetPassword);

//END Customer SignUp functions ********************** //
router
  .route("/addcusaddress")
  .post(ClientAuthentication.checkTokenClient, CustomerFunctions.addCusAddress);

router
  .route("/address")
  .post(ClientAuthentication.checkTokenClient, CustomerFunctions.address);

router
  .route("/checkout")
  .post(ClientAuthentication.checkTokenClient, CustomerFunctions.checkOut);

router
  .route("/getmyorders")
  .post(ClientAuthentication.checkTokenClient, CustomerFunctions.getMyOrdrs);

router.route("/getallworkshops").post(CustomerFunctions.getAllWorkshops);
router
  .route("/getallpublishedworkshops_date")
  .post(CustomerFunctions.getAllPublishedWorkshops_date);

router
  .route("/getallpublishedworkshops")
  .post(CustomerFunctions.getAllPublishedWorkshops);
router.route("/getworkshop").post(CustomerFunctions.getWorkshop);

router.route("/getworkshopimages").post(CustomerFunctions.getWorkshopImages);

router
  .route("/getallworkshopimages")
  .post(CustomerFunctions.getAllWorkshopImages);

router
  .route("/workshopregistration")
  .post(CustomerFunctions.workshopRegistration);

router
  .route("/uploadcustomproduct")
  .post(
    ClientAuthentication.checkTokenClient,
    CustomerFunctions.uploadCustomProduct
  );

router
  .route("/contactussubmit")
  .post(
    ClientAuthentication.checkTokenClient,
    CustomerFunctions.contactUsSubmit
  );

module.exports = router;
