const scheduleService = require("../services/schedule.service");

function handleError(res, error) {
  const status = error.status || 500;
  res.status(status).json({ error: error.message });
}

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await scheduleService.listSchedules();
    res.json({ data: schedules });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getDeviceSchedules = async (req, res) => {
  try {
    const schedules = await scheduleService.listSchedulesByDevice(req.params.deviceId);
    res.json({ data: schedules });
  } catch (error) {
    handleError(res, error);
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    res.status(201).json({ data: schedule });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
    res.json({ data: schedule });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const result = await scheduleService.deleteSchedule(req.params.id);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
