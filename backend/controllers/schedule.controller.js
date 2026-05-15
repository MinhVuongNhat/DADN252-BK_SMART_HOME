const db = require("../config/db");
const service = require("../services/schedule.service");
const logController = require('../controllers/log.controller');

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
 * Lưu ý: Trong logic của bạn, id này là device_id
 */
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params; // Đây là device_id từ route /api/schedules/:id
    const { name, power_status, control_mode, start_time, end_time } = req.body;

    // 1. Cập nhật bảng devices trước
    await db.query(`
      UPDATE devices 
      SET name = N'${name || 'Thiết bị'}', 
          control_mode = '${control_mode || 'manual'}',
          power_status = '${power_status || 'off'}'
      WHERE device_id = ${id}
    `);

    // 2. Xử lý logic Schedule qua Service
    if (control_mode === 'schedule' && start_time && end_time) {
      await service.upsertSchedule(id, { start_time, end_time, name });
    } else {
      // Nếu không dùng schedule, chuyển is_active về 0
      await service.toggleSchedule(id, false);
    }

    // 3. Ghi Log an toàn (Chống lỗi toUpperCase)
    const modeStr = String(control_mode || 'manual').toUpperCase();
    await logController.internalCreateLog({
      userId: 1,
      deviceId: id,
      actionType: 'UPDATE_CONFIG',
      description: `Chế độ: ${modeStr}`
    });

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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
    const data = await service.toggleSchedule(req.params.id, req.body.is_active);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};