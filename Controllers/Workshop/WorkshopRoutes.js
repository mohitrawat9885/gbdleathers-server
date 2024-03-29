const express = require("express");
const WorkshopController = require("./WorkshopController");

const router = express.Router();

router
  .route("/")
  .post(
    WorkshopController.uploadWorkshopImages,
    WorkshopController.resizeWorkshopImages,
    WorkshopController.preCreateWorkshop,
    WorkshopController.createWorkshop
  );

router.route("/:type").get((req, res, next) => {
  req.body.for = "workshop";
  next();
}, WorkshopController.getAllWorkshops);
router
  .route("/:id")
  .get((req, res, next) => {
    req.body.for = "workshop";
    next();
  }, WorkshopController.getWorkshop)
  .patch(
    WorkshopController.uploadWorkshopImages,
    WorkshopController.resizeWorkshopImages,
    WorkshopController.preCreateWorkshop,
    WorkshopController.updateWorkshop
  )
  .delete(WorkshopController.removeWorkshop);
router
  .route("/:id/images")
  .get(WorkshopController.getWorkshopImages)
  .post(
    WorkshopController.uploadWorkshopImages,
    WorkshopController.resizeWorkshopImages,
    WorkshopController.addWorkshopImages
  );
router
  .route("/:id/images/:image")
  .delete(WorkshopController.removeWorkshopImage);

router.route("/participants").get(WorkshopController.getAllParticipants);
router
  .route("/participants/:id")
  .get(WorkshopController.getParticipant)
  .delete(WorkshopController.removeParticipant)
  .patch(WorkshopController.updateParticipant);

module.exports = router;
