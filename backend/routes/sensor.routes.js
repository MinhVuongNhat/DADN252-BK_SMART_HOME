const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Dùng lại cái Auth Thắng làm hôm trước

// Thêm authMiddleware để chỉ user đã login mới xem được sensor
router.get('/latest/:type', authMiddleware, sensorController.getLatest);
router.get('/history/:type', authMiddleware, sensorController.getHistory);
router.get('/', authMiddleware, sensorController.getAllSensors);

module.exports = router;