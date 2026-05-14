// backend/workers/schedule.worker.js
const mqtt = require('mqtt');
const cron = require('node-cron');
const { Log } = require('../models');
const sequelize = require('../config/db');

// Kết nối MQTT trực tiếp (theo phong cách của automation.worker.js)
const client = mqtt.connect(process.env.MQTT_BROKER);

client.on('connect', () => {
    console.log('✅ Schedule Worker đã kết nối MQTT Broker');
});

// Xử lý Lịch trình (Chạy mỗi phút)
cron.schedule('* * * * *', async () => {
    console.log('⏰ Đang kiểm tra lịch trình...');
    try {
        // Thực thi Store Procedure để lấy danh sách cần chạy
        const [results] = await sequelize.query("EXEC SP_Process_Schedules");
        
        if (results && results.length > 0) {
            for (const schedule of results) {
                // Xác định lệnh: Bật = 1, Tắt = 0
                const payload = schedule.action_type === 'turn_on' ? '1' : '0';
                
                // Nhóm dặn: mqtt_topic_sub là topic để thiết bị nhận lệnh (điều khiển)
                if (schedule.mqtt_topic_sub) {
                    client.publish(schedule.mqtt_topic_sub, payload);
                    
                    console.log(`🚀 Thực thi: ${schedule.name} -> Topic: ${schedule.mqtt_topic_sub} (${payload})`);

                    // Ghi log vào bảng activity_logs thông qua model Log
                    await Log.create({
                        device_id: schedule.device_id,
                        action_type: 'schedule_run',
                        description: `Lịch trình "${schedule.name}" tự động thực hiện: ${schedule.action_type === 'turn_on' ? 'Bật' : 'Tắt'}`
                    });
                }
            }
        }
    } catch (err) {
        console.error('❌ Lỗi Schedule Worker:', err);
    }
});