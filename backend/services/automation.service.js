const mqttService = require("./mqtt.service");
const mqttConfig = require("../config/mqtt");
const ConditionEvaluator = require("../strategies/evaluator.strategy");

// Import các Models (Bà nhớ tạo Model cho các bảng này nhé)
const { Sensor } = require("../models");
const Device = require("../models/Device");
const Log = require("../models/Log"); // Hoặc ActivityLog tùy bà đặt tên
const { AutomationRule, AutomationCondition, AutomationAction } = require("../models"); 

class AutomationService {
  
  // Hàm này tự động chạy khi mqtt.service.js gọi notifyAll()
  async update(topic, message) {
    const feedKey = topic.split('/').pop();
    const currentSensorValue = parseFloat(message);

    if (isNaN(currentSensorValue)) return; // Bỏ qua nếu data không phải số

    try {
      // 1. Tìm Sensor dựa trên topic vừa nhận
      const sensor = await Sensor.findOne({ where: { mqtt_topic: feedKey } });
      if (!sensor) return;

      // 2. Tìm tất cả Điều kiện (Conditions) đang tham chiếu tới Sensor này
      // Kèm theo Rule (phải đang active) và Action tương ứng
      const conditions = await AutomationCondition.findAll({
        where: { sensor_id: sensor.sensor_id },
        include: [{
          model: AutomationRule,
          where: { is_active: true }, // Chỉ xét các Rule đang được BẬT
          include: [{ model: AutomationAction }]
        }]
      });

      // 3. Duyệt qua từng điều kiện để kiểm tra (Engine)
      for (const condition of conditions) {
        const rule = condition.AutomationRule; // Lấy thông tin Rule chứa điều kiện này

        // Dùng Strategy để so sánh
        const isTriggered = ConditionEvaluator.evaluate(
          currentSensorValue, 
          condition.operator, 
          condition.target_value
        );

        if (isTriggered) {
          console.log(`🤖 Rule Triggered: [${rule.name}] vì ${sensor.name} ${condition.operator} ${condition.target_value}`);
          
          // 4. Nếu thỏa mãn, thực thi tất cả các Hành động (Actions) của Rule đó
          for (const action of rule.AutomationActions) {
            
            // Tìm thiết bị cần điều khiển
            const device = await Device.findByPk(action.device_id);
            
            // LOGIC CỰC QUAN TRỌNG: Chỉ chạy tự động nếu thiết bị đang ở chế độ 'automation'
            if (!device || device.control_mode !== 'automation') {
              console.log(`⚠️ Bỏ qua điều khiển ${device?.name} do chế độ là ${device?.control_mode}`);
              continue; 
            }

            // Chuyển action_type từ DB ('turn_on', 'turn_off') thành lệnh MQTT ('ON', 'OFF')
            const command = action.action_type === 'turn_on' ? 'ON' : 'OFF';
            
            // Ghép Topic và Publish
            const pubTopic = `${mqttConfig.username}/feeds/${device.mqtt_topic_pub || 'device-' + device.device_id}`;
            mqttService.publish(pubTopic, command);

            // Ghi Log vào Database
            await Log.create({
              user_id: rule.user_id,
              device_id: device.device_id,
              action_type: "AUTOMATION",
              description: `Hệ thống tự động ${command} [${device.name}] (Quy tắc: ${rule.name})`
            });
          }
        }
      }
    } catch (error) {
      console.error("❌ Lỗi Automation Engine:", error);
    }
  }
}

module.exports = new AutomationService();