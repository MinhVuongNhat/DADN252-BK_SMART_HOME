const sql = require("../config/db");

exports.getDevices = async (req, res) => {
  try {
    const result = await sql.query(`
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

    const result = await sql.query`
      SELECT 
        device_id,
        name,
        type,
        location,
        power_status,
        control_mode,
        connection_status
      FROM devices
      WHERE device_id = ${id}
    `;

    // Không tìm thấy
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.createDevice = async (req, res) => {
  try {
    const { name, type, location } = req.body;

    await sql.query(`
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
    const {
      name,
      power_status,
      control_mode
    } = req.body;

    await sql.query(`
      UPDATE devices
      SET
        name = N'${name}',
        power_status = '${power_status}',
        control_mode = '${control_mode}'
      WHERE device_id = ${id}
    `);

    res.json({
      success: true,
      message: "Cập nhật thành công"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    await sql.query(`
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
    const { type, mode } = req.body;

    if (type === "power") {
      await sql.query(`
        UPDATE devices
        SET power_status =
          CASE
            WHEN power_status = 'on' THEN 'off'
            ELSE 'on'
          END
        WHERE device_id = ${id}
      `);
    }

    if (type === "mode") {
      await sql.query(`
        UPDATE devices
        SET control_mode = '${mode}'
        WHERE device_id = ${id}
      `);
    }

    res.json({
      success: true,
      message: "Toggle thành công"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateDeviceMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { control_mode } = req.body;

    await sql.query(`
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

    await sql.query(`
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