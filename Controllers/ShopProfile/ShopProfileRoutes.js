const express = require('express');
const ShopProfileController = require('./ShopProfileController');

const router = express.Router();

// router.use(ShopProfileController.checkIfShopProfile);
router
  .route('/')
  .get(ShopProfileController.getShopProfile)
  .patch(
    ShopProfileController.uploadShopProfileImages,
    ShopProfileController.resizeShopProfileImages,
    ShopProfileController.updateShopProfile
  );

router
  .route('/gallary')
  .post(
    ShopProfileController.uploadShopGallaryImage,
    ShopProfileController.resizeShopGallaryImage,
    ShopProfileController.saveShopGallaryImageName
  )
  .get(ShopProfileController.getShopGallary);

router
  .route('/gallary/:id')
  .delete(ShopProfileController.removeShopGallaryImageName);

module.exports = router;
