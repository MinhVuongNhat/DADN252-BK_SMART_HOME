const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Định nghĩa đúng cái đường dẫn trong README: /api/auth/signup
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;