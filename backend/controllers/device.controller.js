const db = require("../config/db");
const logController = require("./log.controller");
const client = require("../services/mqtt.service");

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

    // =========================
    // 1. Lấy dữ liệu request
    // =========================
    const {
      name = "Thiết bị",
      power_status = "off",
      control_mode = "manual",
      start_time,
      end_time,
    } = req.body;

    // =========================
    // 2. Update device
    // =========================
    await db.query(
      `
      UPDATE devices
      SET 
        name = :name,
        power_status = :power_status,
        control_mode = :control_mode
      WHERE device_id = :id
      `,
      {
        replacements: {
          id,
          name,
          power_status,
          control_mode,
        },
      }
    );

    // =========================
    // 3. Update schedule nếu cần
    // =========================
    if (
      control_mode === "schedule" &&
      start_time &&
      end_time
    ) {
      await db.query(
        `
        IF EXISTS (
          SELECT 1 
          FROM schedules 
          WHERE device_id = :id
        )
        BEGIN
          UPDATE schedules
          SET
            start_time = :start_time,
            end_time = :end_time,
            is_active = 1
          WHERE device_id = :id
        END
        ELSE
        BEGIN
          INSERT INTO schedules (
            device_id,
            start_time,
            end_time,
            is_active
          )
          VALUES (
            :id,
            :start_time,
            :end_time,
            1
          )
        END
        `,
        {
          replacements: {
            id,
            start_time,
            end_time,
          },
        }
      );
    }

    // =========================
    // 4. Lấy MQTT topic
    // =========================
    const [rows] = await db.query(
      `
      SELECT 
        mqtt_topic_pub,
        mqtt_topic_sub
      FROM devices
      WHERE device_id = :id
      `,
      {
        replacements: { id },
      }
    );

    const device = rows[0];

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiết bị",
      });
    }

    // =========================
    // 5. Publish MQTT
    // =========================
    if (power_status) {
      // Ưu tiên publish topic PUB
      const feed =
        device.mqtt_topic_pub ||
        device.mqtt_topic_sub;

      if (!feed) {
        throw new Error(
          "Thiết bị chưa cấu hình MQTT topic"
        );
      }

      const topic =
        `${process.env.ADAFRUIT_AIO_USERNAME}/feeds/${feed}`;

      const payload =
        power_status === "on" ? "1" : "0";

      console.log(`
📤 MQTT Publish (from updateDevice)
Topic: ${topic}
Payload: ${payload}
`);

      client.publish(topic, payload);
    }

    // =========================
    // 6. Ghi log
    // =========================
    await logController.internalCreateLog({
      userId: 1,
      deviceId: id,
      actionType: "UPDATE_DEVICE",
      description:
        `Cập nhật thiết bị ${name}: ` +
        `Trạng thái ${power_status}, ` +
        `Chế độ ${control_mode}`,
    });

    // =========================
    // 7. Response
    // =========================
    return res.json({
      success: true,
      message: "Cập nhật thành công",
    });

  } catch (err) {
    console.error("❌ updateDevice ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
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

    // 1. Đảo trạng thái DB
    await db.query(`
      UPDATE devices
      SET power_status =
        CASE
          WHEN power_status = 'on' THEN 'off'
          ELSE 'on'
        END
      WHERE device_id = ${id}
    `);

    // 2. Lấy thông tin device
    const result = await db.query(`
      SELECT *
      FROM devices
      WHERE device_id = ${id}
    `);

    const device = result.recordset?.[0] || result[0];

    if (!device) {
        throw new Error("Không tìm thấy thiết bị để điều khiển");
    }

    // 3. MQTT topic
    const topic =
      `${process.env.ADAFRUIT_AIO_USERNAME}/feeds/${device.mqtt_topic_sub || device.mqtt_topic_pub}`;

    // 4. Payload
    const payload =
      device.power_status === "on"
        ? "1"
        : "0";

    // 5. Publish
    client.publish(topic, payload);

    console.log(`
📤 MQTT Publish
Topic: ${topic}
Payload: ${payload}
`);

    // 6. Log
    await logController.internalCreateLog({
      userId: 1,
      deviceId: id,
      actionType: "TOGGLE_DEVICE",
      description: `Toggle ${device.name}`
    });

    res.json({
      success: true,
      message: "Điều khiển thiết bị thành công"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });
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

    // Update DB
    await db.query(`
      UPDATE devices
      SET power_status = '${power_status}'
      WHERE device_id = ${id}
    `);

    // Get topic
    const result = await db.query(`
      SELECT mqtt_topic_sub, mqtt_topic_pub
      FROM devices
      WHERE device_id = ${id}
    `);

    const device = result.recordset?.[0] || result[0];

    if (!device) {
        throw new Error("Không tìm thấy thiết bị để cập nhật nguồn");
    }

    const topicName = device.mqtt_topic_sub || device.mqtt_topic_pub;

    // Full topic
    const topic =
`${process.env.ADAFRUIT_AIO_USERNAME}/feeds/${topicName}`;

    // Payload
    const payload =
      power_status === 'on'
        ? '1'
        : '0';

    // Publish
    client.publish(topic, payload);

    console.log(`
📤 MQTT Publish
Topic: ${topic}
Payload: ${payload}
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