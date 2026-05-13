const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard.controller");
// 1. Import bảo vệ vào đây
const authMiddleware = require("../middlewares/auth.middleware"); 

// 2. Chèn authMiddleware vào giữa đường dẫn và hàm xử lý
// Bây giờ req.user mới có dữ liệu để controller xài nha bà
router.get("/summary", authMiddleware, dashboard.getSummary);

router.get("/sensors/latest", authMiddleware, dashboard.getLatestSensors);

router.get("/history/:sensorId", authMiddleware, dashboard.getSensorHistory);

module.exports = router;