const express = require("express");
const CustomerAuthentication = require("../Controllers/CustomerAuthentication");
const CustomerRoutes = require("../Controllers/Customer/CustomerRoutes");
const ReviewRoutes = require("./../Controllers/Reviews/ReviewRoutes");
const ProductController = require("./../Controllers/Product/ProductController");
const CategoryController = require("./../Controllers/Category/CategoryController");
const ReviewController = require("./../Controllers/Reviews/ReviewController");
const WorkshopController = require("./../Controllers/Workshop/WorkshopController");
const ContactUsController = require("./../Controllers/ContactUs/ContactUsController");

const router = express.Router();

// User Routes
router.use("/customer", CustomerRoutes);

router.get("/product", ProductController.getAllProduct);
router.get("/category", CategoryController.getAllCategory);

router.get("/product/:id", ProductController.getProduct);
router.get("/product/:id/variant", ProductController.getVariant);

router.get("/category/:id", CategoryController.getCategory);
router.get("/reviews/:productId", ReviewController.getAllReview);
router.route("/workshop/:type").get(WorkshopController.getClientWorkshop);
router
  .route("/workshop")
  .post(
    WorkshopController.createParticipantData,
    WorkshopController.getParticipantSession
  );

router.route("/workshop-success").get(WorkshopController.paymentSuccess);

router.route("/contact-us").post(ContactUsController.createContactUs);
// Protect Rest all routes
router.use(CustomerAuthentication.protect);
router.use("/customer/reviews", ReviewRoutes);

module.exports = router;
