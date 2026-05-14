class ConditionEvaluator {
  // Thực thi chiến lược so sánh dựa trên toán tử lấy từ DB
  static evaluate(sensorValue, operator, targetValue) {
    switch (operator) {
      case '>': return sensorValue > targetValue;
      case '<': return sensorValue < targetValue;
      case '>=': return sensorValue >= targetValue;
      case '<=': return sensorValue <= targetValue;
      case '=': return sensorValue == targetValue;
      case '!=': return sensorValue != targetValue;
      default: return false;
    }
  }
}

module.exports = ConditionEvaluator;