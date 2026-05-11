const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');

// Lấy danh sách log với query params: ?page=1&limit=10&type=USER
router.get('/', logController.getAllLogs);

// Xóa log cũ (Tùy chọn cho bảo trì)
router.post('/', logController.internalCreateLog);

module.exports = router;