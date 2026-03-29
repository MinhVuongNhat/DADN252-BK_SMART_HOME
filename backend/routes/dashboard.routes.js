const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/summary", dashboardController.getDashboardSummary); // URL: /api/dashboard/summary
router.get("/sensors/latest", dashboardController.getLatestSensors); // URL: /api/dashboard/sensors/latest
router.get("/sensors/history", dashboardController.getSensorHistory); // URL: /api/dashboard/sensors/history

module.exports = router;