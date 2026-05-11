const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard.controller");

router.get("/summary", dashboard.getSummary);

router.get("/sensors/latest", dashboard.getLatestSensors);

router.get("/history/:sensorId", dashboard.getSensorHistory);

module.exports = router;