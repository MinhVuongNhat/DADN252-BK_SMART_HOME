const mqtt = require('mqtt');
const cron = require('node-cron');
const { Log } = require('../models');
const sequelize = require('../config/db');

const client = mqtt.connect(process.env.MQTT_BROKER);

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
                
                if (schedule.mqtt_topic_sub) {
                    client.publish(schedule.mqtt_topic_sub, payload);
                    console.log(`🚀 Thực thi: ${schedule.name} -> ${payload}`);

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