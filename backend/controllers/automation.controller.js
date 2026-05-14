const { 
  AutomationRule, 
  AutomationCondition, 
  AutomationAction, 
  Sensor, 
  Device 
} = require("../models");
const sequelize = require("../config/db");

// 1. LẤY DANH SÁCH LUẬT (Để render ra màn hình chính)
exports.getRules = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const rules = await AutomationRule.findAll({
      where: { user_id: userId },
      include: [
        { 
          model: AutomationCondition,
          include: [{ model: Sensor, attributes: ['name', 'type', 'unit'] }] 
        },
        { 
          model: AutomationAction,
          include: [{ model: Device, attributes: ['name', 'type'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(rules);
  } catch (error) {
    console.error("Lỗi getRules:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy danh sách luật" });
  }
};

// 2. LẤY DỮ LIỆU OPTIONS CHO DROPDOWN (Cảm biến & Thiết bị)
exports.getFormOptions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Lấy danh sách cảm biến
    const sensors = await Sensor.findAll({
      where: { user_id: userId },
      attributes: ['sensor_id', 'name', 'type', 'unit']
    });

    // Lấy danh sách thiết bị
    const devices = await Device.findAll({
      where: { user_id: userId },
      attributes: ['device_id', 'name', 'type']
    });

    res.json({ sensors, devices });
  } catch (error) {
    console.error("Lỗi getFormOptions:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy dữ liệu form" });
  }
};

// 3. TẠO LUẬT MỚI (Dùng Transaction)
exports.createRule = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const { name, condition, action } = req.body; 

    // B1: Lưu vào bảng automation_rules
    const newRule = await AutomationRule.create({
      user_id: userId,
      name: name,
      is_active: 1
    }, { transaction: t });

    // B2: Lưu vào bảng automation_conditions
    await AutomationCondition.create({
      rule_id: newRule.rule_id,
      sensor_id: condition.sensor_id,
      operator: condition.operator,
      target_value: condition.target_value
    }, { transaction: t });

    // B3: Lưu vào bảng automation_actions
    await AutomationAction.create({
      rule_id: newRule.rule_id,
      device_id: action.device_id,
      action_type: action.action_type
    }, { transaction: t });

    // Chốt giao dịch
    await t.commit(); 
    res.status(201).json({ message: "Tạo luật thành công!", rule_id: newRule.rule_id });
  } catch (error) {
    await t.rollback(); // Bị lỗi ở đâu thì hủy toàn bộ
    console.error("Lỗi createRule:", error);
    res.status(500).json({ message: "Lỗi khi tạo luật mới" });
  }
};

// 4. CẬP NHẬT LUẬT (Dùng Transaction)
exports.updateRule = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const ruleId = req.params.id;
    const userId = req.user.user_id;
    const { name, condition, action } = req.body;

    // Kiểm tra xem luật có tồn tại và có thuộc về user này không
    const existingRule = await AutomationRule.findOne({
      where: { rule_id: ruleId, user_id: userId }
    });

    if (!existingRule) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy luật này!" });
    }

    // Cập nhật Tên luật
    await AutomationRule.update(
      { name: name },
      { where: { rule_id: ruleId }, transaction: t }
    );

    // Cập nhật Điều kiện (Condition)
    await AutomationCondition.update({
      sensor_id: condition.sensor_id,
      operator: condition.operator,
      target_value: condition.target_value
    }, { where: { rule_id: ruleId }, transaction: t });

    // Cập nhật Hành động (Action)
    await AutomationAction.update({
      device_id: action.device_id,
      action_type: action.action_type
    }, { where: { rule_id: ruleId }, transaction: t });

    await t.commit();
    res.json({ message: "Cập nhật luật thành công!" });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi updateRule:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật luật" });
  }
};

// 5. BẬT / TẮT NHANH MỘT LUẬT (Dùng cho nút gạt Toggle trên UI)
exports.toggleRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const userId = req.user.user_id;
    const { is_active } = req.body; // true hoặc false

    const rule = await AutomationRule.findOne({
      where: { rule_id: ruleId, user_id: userId }
    });

    if (!rule) {
      return res.status(404).json({ message: "Không tìm thấy luật này!" });
    }

    rule.is_active = is_active;
    await rule.save();

    res.json({ message: `Đã ${is_active ? 'bật' : 'tắt'} luật thành công!` });
  } catch (error) {
    console.error("Lỗi toggleRule:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// 6. XÓA LUẬT
exports.deleteRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const userId = req.user.user_id;

    const rule = await AutomationRule.findOne({
      where: { rule_id: ruleId, user_id: userId }
    });

    if (!rule) {
      return res.status(404).json({ message: "Không tìm thấy luật này!" });
    }

    // Vì Database set ON DELETE CASCADE, nên xóa Rule sẽ tự xóa Condition & Action luôn
    await rule.destroy();
    res.json({ message: "Đã xóa luật thành công!" });
  } catch (error) {
    console.error("Lỗi deleteRule:", error);
    res.status(500).json({ message: "Lỗi Server khi xóa luật" });
  }
};