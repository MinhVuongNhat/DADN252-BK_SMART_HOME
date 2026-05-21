const mqttService = require("./mqtt.service");
const mqttConfig = require("../config/mqtt");
const ConditionEvaluator = require("../utils/evaluator.strategy");

const { Sensor } = require("../models");
const Device = require("../models/Device");
const Log = require("../models/Log"); 
const { AutomationRule, AutomationCondition, AutomationAction } = require("../models"); 

class AutomationService {
  

  async update(topic, message) {
    const feedKey = topic.split('/').pop();
    const currentSensorValue = parseFloat(message);

    if (isNaN(currentSensorValue)) return; 

    try {
   
      const sensor = await Sensor.findOne({ where: { mqtt_topic: feedKey } });
      if (!sensor) return;


      const conditions = await AutomationCondition.findAll({
        where: { sensor_id: sensor.sensor_id },
        include: [{
          model: AutomationRule,
          where: { is_active: true }, 
          include: [{ model: AutomationAction }]
        }]
      });

   
      for (const condition of conditions) {
        const rule = condition.AutomationRule; 

        
        const isTriggered = ConditionEvaluator.evaluate(
          currentSensorValue, 
          condition.operator, 
          condition.target_value
        );

        if (isTriggered) {
          console.log(`🤖 Rule Triggered: [${rule.name}] vì ${sensor.name} ${condition.operator} ${condition.target_value}`);
          
         
          for (const action of rule.AutomationActions) {
            
            
            const device = await Device.findByPk(action.device_id);
            
          
            if (!device || device.control_mode !== 'automation') {
              console.log(`⚠️ Bỏ qua điều khiển ${device?.name} do chế độ là ${device?.control_mode}`);
              continue; 
            }

   
            const command = action.action_type === 'turn_on' ? 'ON' : 'OFF';
            
          
            const pubTopic = `${mqttConfig.username}/feeds/${device.mqtt_topic_sub || device.mqtt_topic_pub || 'device-' + device.device_id}`;
            mqttService.publish(pubTopic, command);

        
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
