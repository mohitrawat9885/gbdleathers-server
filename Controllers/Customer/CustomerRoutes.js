const express = require('express');
const CustomerAuthentication = require('./../CustomerAuthentication');
const CustomerController = require('./CustomerController');

const router = express.Router();

router.post('/signup', CustomerAuthentication.signup);
router.post('/login', CustomerAuthentication.login);
router.get('/logout', CustomerAuthentication.logout);
router.post('/forgotPassword', CustomerAuthentication.forgotPassword);
router.patch('/resetPassword/:token', CustomerAuthentication.resetPassword);

router.use(CustomerAuthentication.protect);

router.patch('/updateMyPassword', CustomerAuthentication.updatePassword);
router.patch('/updateMe', CustomerController.updateMe);

router
  .route('/address')
  .post(CustomerController.createAddress)
  .get(CustomerController.getAddress);
router
  .route('/address/:id')
  .patch(CustomerController.updateAddress)
  .delete(CustomerController.deleteAddress);

module.exports = router;
