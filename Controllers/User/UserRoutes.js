const express = require('express');
const ShopAuthentication = require('./../ShopAuthentication');
const UserController = require('./UserController');

const router = express.Router();

router.post('/signup', ShopAuthentication.protect, ShopAuthentication.signup);
router.post('/login', ShopAuthentication.login);
router.get('/logout', ShopAuthentication.logout);
router.post('/forgotPassword', ShopAuthentication.forgotPassword);
router.patch('/resetPassword/:token', ShopAuthentication.resetPassword);

router.use(ShopAuthentication.protect);
router.patch('/updateMyPassword', ShopAuthentication.updatePassword);
router.patch('/updateMe', UserController.updateMe);

module.exports = router;
