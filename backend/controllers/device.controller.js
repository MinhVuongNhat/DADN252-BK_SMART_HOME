const db = require("../config/db");
const logController = require("./log.controller");

// (Hàm getDevices giữ nguyên như lần fix trước)
exports.getDevices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        device_id, name, type, location, power_status, control_mode, connection_status
      FROM devices
      ORDER BY created_at DESC
    `);

    const deviceData = result.recordset || result.rows || (Array.isArray(result) ? result : []);
    res.json({ success: true, data: deviceData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT d.*, s.start_time, s.end_time, s.is_active as schedule_active
      FROM devices d
      LEFT JOIN schedules s ON d.device_id = s.device_id
      WHERE d.device_id = ${id}
    `);

    // Xử lý mảng trả về an toàn
    const data = result.recordset || result.rows || result;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "Device not found" });
    }

    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDevice = async (req, res) => {
  try {
    // Thêm fallback an toàn tránh undefined
    const name = req.body.name || 'Thiết bị mới';
    const type = req.body.type || 'light';
    const location = req.body.location || '';

    await db.query(`
      INSERT INTO devices (user_id, name, type, location, power_status, control_mode, connection_status)
      VALUES (1, N'${name}', '${type}', N'${location}', 'off', 'manual', 'online')
    `);

    res.json({ success: true, message: "Tạo thiết bị thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy giá trị với fallback an toàn để chống lỗi CHECK CONSTRAINT
    const name = req.body.name || 'Thiết bị';
    const power_status = req.body.power_status || 'off'; 
    const control_mode = req.body.control_mode || 'manual';
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;

    // 1. Cập nhật thiết bị
    await db.query(`
      UPDATE devices
      SET name = N'${name}', power_status = '${power_status}', control_mode = '${control_mode}'
      WHERE device_id = ${id}
    `);

    // 2. Xử lý schedule
    if (control_mode === 'schedule' && start_time && end_time) {
      await db.query(`
        IF EXISTS (SELECT 1 FROM schedules WHERE device_id = ${id})
          UPDATE schedules SET start_time = '${start_time}', end_time = '${end_time}', is_active = 1 WHERE device_id = ${id}
        ELSE
          INSERT INTO schedules (device_id, start_time, end_time, is_active) VALUES (${id}, '${start_time}', '${end_time}', 1)
      `);
    }

    // 3. Ghi log
    await logController.internalCreateLog({
      userId: 1,
      deviceId: id,
      actionType: 'UPDATE_DEVICE',
      description: `Cập nhật thiết bị ${name}: Trạng thái ${power_status}, Chế độ ${control_mode}`
    });

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // SỬA LỖI FK CONSTRAINT: Xóa các bảng con trước
    // Nếu tương lai có bảng log_devices hoặc automation_actions, bạn cũng cần thêm lệnh DELETE ở đây
    await db.query(`DELETE FROM schedules WHERE device_id = ${id}`);
    
    // Sau đó mới xóa thiết bị
    await db.query(`DELETE FROM devices WHERE device_id = ${id}`);

    res.json({ success: true, message: "Xóa thiết bị thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ĐÃ VIẾT LẠI HOÀN TOÀN HÀM TOGGLE
exports.toggleDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; 
    let actionDesc = "";

    // Dùng SQL Server tự đảo trạng thái (Không cần Frontend gửi trạng thái lên)
    if (type === "power") {
      await db.query(`
        UPDATE devices 
        SET power_status = CASE WHEN power_status = 'on' THEN 'off' ELSE 'on' END 
        WHERE device_id = ${id}
      `);
      actionDesc = `Thay đổi nguồn thiết bị ${id}`;
    } else if (type === "mode") {
      await db.query(`
        UPDATE devices 
        SET control_mode = CASE WHEN control_mode = 'automation' THEN 'manual' ELSE 'automation' END 
        WHERE device_id = ${id}
      `);
      actionDesc = `Thay đổi chế độ thiết bị ${id}`;
    }

    // Ghi log
    await logController.internalCreateLog({
      userId: 1,
      deviceId: id,
      actionType: 'TOGGLE_DEVICE',
      description: actionDesc
    });

    res.json({ success: true, message: "Thao tác thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ... (Các hàm updateDeviceMode và updateDevicePower giữ nguyên nếu bạn vẫn dùng API lẻ)

exports.updateDeviceMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { control_mode } = req.body;

    await db.query(`
      UPDATE devices
      SET control_mode = '${control_mode}'
      WHERE device_id = ${id}
    `);

    res.json({
      success: true,
      message: "Cập nhật chế độ thành công"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateDevicePower = async (req, res) => {
  try {
    const { id } = req.params;
    const { power_status } = req.body;

    await db.query(`
      UPDATE devices
      SET power_status = '${power_status}'
      WHERE device_id = ${id}
    `);

    res.json({
      success: true,
      message: "Cập nhật trạng thái nguồn thành công"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};