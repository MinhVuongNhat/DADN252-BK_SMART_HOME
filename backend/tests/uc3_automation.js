// tests/uc3_automation.js
const { API_URL, assert, getAuthHeaders } = require('./helpers');

async function testAutomation() {
    console.log("\n--- UC3: Automation Branches ---");

    // Branch 1: Create HIGH threshold rule
    const rule1Res = await fetch(`${API_URL}/automation`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            name: "Bật quạt khi nóng (> 30C)",
            condition: { sensor_id: 1, operator: ">", target_value: 30 }, 
            action: { device_id: 2, action_type: "turn_on" }               
        })
    });
    assert(rule1Res.status === 200 || rule1Res.status === 201, "High-temp trigger rule created", "Failed high-temp rule");

    // Branch 2: Create LOW threshold rule
    const rule2Res = await fetch(`${API_URL}/automation`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            name: "Tắt quạt khi mát (< 25C)",
            condition: { sensor_id: 1, operator: "<", target_value: 25 }, 
            action: { device_id: 2, action_type: "turn_off" }               
        })
    });
    assert(rule2Res.status === 200 || rule2Res.status === 201, "Low-temp trigger rule created", "Failed low-temp rule");

    // Branch 3: Disable rule using PUT instead of the missing PATCH route
    // Since the backend's validation check requires the condition object, 
    // we must send the FULL rule back, but with is_active flipped to false.
    const toggleRes = await fetch(`${API_URL}/automation/1`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            name: "Bật quạt khi nóng (> 30C)",
            is_active: false, // <-- The actual toggle switch
            condition: { sensor_id: 1, operator: ">", target_value: 30 }, 
            action: { device_id: 2, action_type: "turn_on" }               
        })
    });
    
    if (toggleRes.status === 200) {
        assert(true, "Automation rule successfully toggled OFF (using full PUT payload)", "");
    } else {
        const errText = await toggleRes.text();
        assert(false, "", `Failed to toggle rule. Status: ${toggleRes.status}. Server says: ${errText}`);
    }
}

module.exports = testAutomation;
