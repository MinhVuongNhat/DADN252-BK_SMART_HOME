// Giao diện chung cho mọi Strategy
class AutomationStrategy {
  execute(feedKey, value) {
    throw new Error("Phải implement hàm execute()");
  }
}

// Strategy 1: Nếu nhiệt độ > 30 thì bật quạt
class HighTempStrategy extends AutomationStrategy {
  execute(feedKey, value) {
    if (feedKey === "nhietdo" && value > 30) {
      return { action: "ON", deviceFeed: "quat" };
    }
    return null;
  }
}

// Strategy 2: Nếu ánh sáng < 100 thì bật đèn
class LowLightStrategy extends AutomationStrategy {
  execute(feedKey, value) {
    if (feedKey === "anhsang" && value < 100) {
      return { action: "ON", deviceFeed: "den" };
    }
    return null;
  }
}

module.exports = { HighTempStrategy, LowLightStrategy };