const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// LẤY DANH SÁCH TẤT CẢ CẢM BIẾN CỦA USER (THÊM DÒNG NÀY NÈ BÀ)
router.get('/', authMiddleware, sensorController.getAllMySensors);

// Thêm authMiddleware để chỉ user đã login mới xem được sensor
router.get('/latest/:type', authMiddleware, sensorController.getLatest);
router.get('/history/:type', authMiddleware, sensorController.getHistory);

module.exports = router;