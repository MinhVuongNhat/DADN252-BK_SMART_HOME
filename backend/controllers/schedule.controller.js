const service = require("../services/schedule.service");

/**
 * POST /api/schedules
 */
exports.createSchedule = async (req, res) => {
  try {
    const data = await service.createSchedule(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/devices/:id/schedules
 */
exports.getSchedulesByDevice = async (req, res) => {
  try {
    const data = await service.getSchedulesByDevice(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/schedules/:id
 */
exports.updateSchedule = async (req, res) => {
  try {
    const data = await service.updateSchedule(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/schedules/:id
 */
exports.deleteSchedule = async (req, res) => {
  try {
    await service.deleteSchedule(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/schedules/:id/active
 */
exports.toggleSchedule = async (req, res) => {
  try {
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be boolean"
      });
    }

    const data = await service.toggleSchedule(req.params.id, is_active);
    res.json({ success: true, data });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};