const {
  AutomationRule,
  AutomationCondition,
  AutomationAction,
  Sensor,
  Device,
} = require("../models");
const sequelize = require("../config/db");
const { Op } = require("sequelize");

const checkConflict = async (userId, newCond, newAct, currentRuleId = null) => {
  
  const existingRules = await AutomationRule.findAll({
    where: {
      user_id: userId,
      is_active: 1,
      rule_id: { [Op.ne]: currentRuleId },
    },
    include: [
      { model: AutomationCondition, where: { sensor_id: newCond.sensor_id } },
      { model: AutomationAction, where: { device_id: newAct.device_id } },
    ],
  });

  for (const rule of existingRules) {
    const extCond = rule.AutomationConditions[0];
    const extAct = rule.AutomationActions[0];

    
    if (extAct.action_type === newAct.action_type) continue;

    const v1 = parseFloat(newCond.target_value);
    const v2 = parseFloat(extCond.target_value);
    const op1 = newCond.operator;
    const op2 = extCond.operator;

    // --- BỘ LOGIC KIỂM TRA GIAO THOA (CONFLICT) ---

    // TH1: Một trong hai là dấu "="
    if (op1 === "=") {
      if (op2 === "=") {
        if (v1 === v2) return true;
      } 
      if (op2 === ">") {
        if (v1 > v2) return true;
      } 
      if (op2 === "<") {
        if (v1 < v2) return true;
      } 
    } else if (op2 === "=") {
      if (op1 === ">") {
        if (v2 > v1) return true;
      }
      if (op1 === "<") {
        if (v2 < v1) return true;
      }
    }

    // TH2: Cùng dấu (Chắc chắn giao nhau ở vô cực)
    else if (op1 === op2) return true;
    // TH3: Một cái ">" và một cái "<"
    else if (op1 === ">" && op2 === "<") {
      if (v1 < v2) return true;
    } else if (op1 === "<" && op2 === ">") {
      if (v1 > v2) return true; 
    }
  }
  return false;
};

exports.getRules = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const rules = await AutomationRule.findAll({
      where: { user_id: userId },
      include: [
        {
          model: AutomationCondition,
          include: [{ model: Sensor, attributes: ["name", "type", "unit"] }],
        },
        {
          model: AutomationAction,
          include: [{ model: Device, attributes: ["name", "type"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(rules);
  } catch (error) {
    console.error("Lỗi getRules:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy danh sách luật" });
  }
};
exports.getFormOptions = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Lấy danh sách cảm biến
    const sensors = await Sensor.findAll({
      where: { user_id: userId },
      attributes: ["sensor_id", "name", "type", "unit"],
    });

    // Lấy danh sách thiết bị
    const devices = await Device.findAll({
      where: { user_id: userId },
      attributes: ["device_id", "name", "type"],
    });

    res.json({ sensors, devices });
  } catch (error) {
    console.error("Lỗi getFormOptions:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy dữ liệu form" });
  }
};


exports.createRule = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.user_id;
    const { name, condition, action } = req.body;
    const isConflict = await checkConflict(userId, condition, action);
    if (isConflict) {
      return res.status(400).json({
        message:
          "Mâu thuẫn logic! Thiết bị này đã có luật thực hiện hành động ngược lại trong vùng giá trị này.",
      });
    }
    // Lưu vào bảng automation_rules
    const newRule = await AutomationRule.create(
      {
        user_id: userId,
        name: name,
        is_active: 1,
      },
      { transaction: t },
    );

    // Lưu vào bảng automation_conditions
    await AutomationCondition.create(
      {
        rule_id: newRule.rule_id,
        sensor_id: condition.sensor_id,
        operator: condition.operator,
        target_value: condition.target_value,
      },
      { transaction: t },
    );

    // Lưu vào bảng automation_actions
    await AutomationAction.create(
      {
        rule_id: newRule.rule_id,
        device_id: action.device_id,
        action_type: action.action_type,
      },
      { transaction: t },
    );

    // Chốt giao dịch
    await t.commit();
    res
      .status(201)
      .json({ message: "Tạo luật thành công!", rule_id: newRule.rule_id });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi createRule:", error);
    res.status(500).json({ message: "Lỗi khi tạo luật mới" });
  }
};


exports.updateRule = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const ruleId = req.params.id;
    const userId = req.user.user_id;
    const { name, condition, action } = req.body;
    const isConflict = await checkConflict(userId, condition, action, ruleId);
    
    if (isConflict) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Cập nhật thất bại! Luật mới bị mâu thuẫn với các luật đang có." 
      });
    }

    
    const existingRule = await AutomationRule.findOne({
      where: { rule_id: ruleId, user_id: userId },
    });

    if (!existingRule) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy luật này!" });
    }

    // Cập nhật Tên luật
    await AutomationRule.update(
      { name: name },
      { where: { rule_id: ruleId }, transaction: t },
    );

    // Cập nhật Điều kiện 
    await AutomationCondition.update(
      {
        sensor_id: condition.sensor_id,
        operator: condition.operator,
        target_value: condition.target_value,
      },
      { where: { rule_id: ruleId }, transaction: t },
    );

    // Cập nhật Hành động 
    await AutomationAction.update(
      {
        device_id: action.device_id,
        action_type: action.action_type,
      },
      { where: { rule_id: ruleId }, transaction: t },
    );

    await t.commit();
    res.json({ message: "Cập nhật luật thành công!" });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi updateRule:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật luật" });
  }
};

exports.toggleRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const userId = req.user.user_id;
    const { is_active } = req.body; // true hoặc false

    const rule = await AutomationRule.findOne({
      where: { rule_id: ruleId, user_id: userId },
    });

    if (!rule) {
      return res.status(404).json({ message: "Không tìm thấy luật này!" });
    }

    rule.is_active = is_active;
    await rule.save();

    res.json({ message: `Đã ${is_active ? "bật" : "tắt"} luật thành công!` });
  } catch (error) {
    console.error("Lỗi toggleRule:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};


exports.deleteRule = async (req, res) => {
  try {
    const ruleId = req.params.id;
    const userId = req.user.user_id;

    const rule = await AutomationRule.findOne({
      where: { rule_id: ruleId, user_id: userId },
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
