const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/schedule.controller");

router.get("/schedules", scheduleController.getSchedules);
router.get("/devices/:deviceId/schedules", scheduleController.getDeviceSchedules);
router.post("/schedules", scheduleController.createSchedule);
router.put("/schedules/:id", scheduleController.updateSchedule);
router.delete("/schedules/:id", scheduleController.deleteSchedule);

module.exports = router;
