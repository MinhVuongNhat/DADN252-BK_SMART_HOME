const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard.controller");

const authMiddleware = require("../middlewares/auth.middleware"); 


router.get("/summary", authMiddleware, dashboard.getSummary);

router.get("/sensors/latest", authMiddleware, dashboard.getLatestSensors);

router.get("/history/:sensorId", authMiddleware, dashboard.getSensorHistory);

module.exports = router;