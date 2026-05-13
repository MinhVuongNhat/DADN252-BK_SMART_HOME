const db = require("../config/db");
const logController = require("./log.controller");
const service = require("../services/schedule.service");

exports.getDevices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        device_id,
        name,
        type,
        location,
        power_status,
        control_mode,
        connection_status
      FROM devices
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Sử dụng LEFT JOIN để lấy thông tin schedule nếu có
    const result = await db.query`
      SELECT 
        d.*, 
        s.start_time, 
        s.end_time,
        s.is_active as schedule_active
      FROM devices d
      LEFT JOIN schedules s ON d.device_id = s.device_id
      WHERE d.device_id = ${id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Device not found" });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDevice = async (req, res) => {
  try {
    const { name, type, location } = req.body;

    await db.query(`
      INSERT INTO devices
      (
        user_id,
        name,
        type,
        location,
        power_status,
        control_mode,
        connection_status
      )
      VALUES
      (
        1,
        N'${name}',
        '${type}',
        N'${location}',
        'off',
        'manual',
        'online'
      )
    `);

    res.json({
      success: true,
      message: "Tạo thiết bị thành công"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, power_status, control_mode, start_time, end_time } = req.body;

    // 1. Cập nhật thông tin cơ bản của thiết bị
    await db.query(`
      UPDATE devices
      SET
        name = N'${name}',
        power_status = '${power_status}',
        control_mode = '${control_mode}'
      WHERE device_id = ${id}
    `);

    // 2. Nếu chế độ là 'schedule', cập nhật hoặc tạo mới lịch trình
    if (control_mode === 'schedule' && start_time && end_time) {
      // Logic này tùy thuộc vào việc bạn đã có record schedule chưa
      // Ở đây tôi giả sử bạn dùng service để xử lý (Upsert)
      await db.query(`
        IF EXISTS (SELECT 1 FROM schedules WHERE device_id = ${id})
          UPDATE schedules SET start_time = '${start_time}', end_time = '${end_time}', is_active = 1 WHERE device_id = ${id}
        ELSE
          INSERT INTO schedules (device_id, start_time, end_time, is_active) VALUES (${id}, '${start_time}', '${end_time}', 1)
      `);
    }

    // 3. GHI LOG: Sau khi update thành công, tạo một bản ghi log
    await logController.internalCreateLog({
      userId: 1, // Giả sử user đang login là 1
      deviceId: id,
      actionType: 'UPDATE_DEVICE',
      description: `Cập nhật thiết bị ${name}: Trạng thái ${power_status}, Chế độ ${control_mode}`
    });

    res.json({ success: true, message: "Cập nhật thành công và đã ghi log" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`
      DELETE FROM devices
      WHERE device_id = ${id}
    `);

    res.json({
      success: true,
      message: "Xóa thiết bị thành công"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.toggleDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, mode, status } = req.body; 
    
    let actionDesc = "";

    if (type === "power") {
      // Giả sử FE gửi status mới lên hoặc BE tự toggle
      await db.query(`UPDATE devices SET power_status = '${status}' WHERE device_id = ${id}`);
      actionDesc = `Thay đổi nguồn thành: ${status.toUpperCase()}`;
    }

    if (type === "mode") {
      await db.query(`UPDATE devices SET control_mode = '${mode}' WHERE device_id = ${id}`);
      actionDesc = `Thay đổi chế độ thành: ${mode}`;
    }

    // GHI LOG THAO TÁC NHANH
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