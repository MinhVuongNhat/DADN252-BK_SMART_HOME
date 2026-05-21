require('dotenv').config(); // Cực kỳ quan trọng để đọc file .env
const mqtt = require('mqtt');
const cron = require('node-cron');
const { Log, Device } = require('../models');
const sequelize = require('../config/db');

// Phải có username và password (Key) thì Adafruit mới cho kết nối
const client = mqtt.connect(process.env.MQTT_BROKER, {
    username: process.env.ADAFRUIT_AIO_USERNAME,
    password: process.env.ADAFRUIT_AIO_KEY
});

client.on('connect', () => {
    console.log('✅ Schedule Worker đã kết nối MQTT');
});

cron.schedule('* * * * *', async () => {
    console.log('⏰ [' + new Date().toLocaleTimeString() + '] Kiểm tra lịch trình...');
    try {
        // Gọi Store Procedure
        const results = await sequelize.query("EXEC SP_Process_Schedules");
        
        // Sequelize + MSSQL: Kết quả thường nằm trực tiếp trong kết quả trả về hoặc results[0]
        const schedulesToRun = Array.isArray(results[0]) ? results[0] : results;

        if (schedulesToRun && schedulesToRun.length > 0) {
            for (const schedule of schedulesToRun) {
                const payload = schedule.action_type === 'turn_on' ? '1' : '0';
                
                // Sử dụng topic_sub từ kết quả query (SP_Process_Schedules cần JOIN để lấy cột này)
                const mqtt_topic = schedule.mqtt_topic_sub || schedule.mqtt_topic_pub;
                
                if (mqtt_topic) {
                    const topic =
                    `${process.env.ADAFRUIT_AIO_USERNAME}/feeds/${mqtt_topic}`;

                    client.publish(topic, payload);
                    console.log(`🚀 Thực thi: ${schedule.name} -> ${payload}`);

                    // CẬP NHẬT TRẠNG THÁI THIẾT BỊ TRONG DB
                    await Device.update(
                        { power_status: schedule.action_type === 'turn_on' ? 'on' : 'off' },
                        { where: { device_id: schedule.device_id } }
                    );

                    // Ghi log (Dùng try-catch riêng để tránh kẹt vòng lặp)
                    try {
                        await Log.create({
                            device_id: schedule.device_id,
                            action_type: 'schedule_run',
                            description: `Lịch trình "${schedule.name}" thực hiện: ${schedule.action_type === 'turn_on' ? 'Bật' : 'Tắt'}`
                        });
                    } catch (logErr) {
                        console.error("Lỗi ghi log worker:", logErr.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error('❌ Lỗi Worker:', err.message);
    }
});
