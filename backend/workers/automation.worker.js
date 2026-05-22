// 1. Import các thư viện cần thiết
const mqtt = require('mqtt');
const cron = require('node-cron');
const { AutomationRule, Device, Sensor } = require('../models');
const sequelize = require('../config/db');
const mqttService = require('../services/mqtt.service');

const client = mqtt.connect(process.env.MQTT_BROKER);

client.on('connect', () => {
    // Subscribe vào tất cả các topic cảm biến
    client.subscribe(['nhietdo', 'doam', 'anhsang']);
});

// 3. Xử lý Automation dựa trên cảm biến
client.on('message', async (topic, message) => {
    const value = parseFloat(message.toString());
    // Logic: Tìm Rule liên quan đến topic này -> Kiểm tra điều kiện -> Thực thi Action
    // Tui sẽ viết chi tiết code này nếu bà cần.
});

// 4. Xử lý Lịch trình (Chạy mỗi phút)
cron.schedule('* * * * *', async () => {
    console.log('⏰ Đang kiểm tra lịch trình...');
    try {
        // Gọi Store Procedure bà đã viết
        const [results] = await sequelize.query("EXEC SP_Process_Schedules");
        
        results.forEach(schedule => {
            // Gửi lệnh MQTT dựa trên kết quả từ DB
            mqttService.publish(schedule.mqtt_topic_pub, schedule.action_type, schedule.device_type);
            console.log(`🚀 Đã thực thi lịch trình: ${schedule.name}`);
        });
    } catch (err) {
        console.error('Lỗi Cron Job:', err);
    }
});