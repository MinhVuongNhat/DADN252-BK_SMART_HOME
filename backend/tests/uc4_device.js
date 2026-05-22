// tests/uc4_device.js
const { API_URL, assert, getAuthHeaders } = require('./helpers');

async function testDevices() {
    console.log("\n--- UC4: Manual Control Branches ---");

    // Branch 1: Turn ON
    const turnOnRes = await fetch(`${API_URL}/devices/1/power`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ power_status: "on" })
    });
    assert(turnOnRes.status === 200, "Device successfully turned ON", "Failed to turn ON");

    // Branch 2: Turn OFF
    const turnOffRes = await fetch(`${API_URL}/devices/1/power`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ power_status: "off" })
    });
    assert(turnOffRes.status === 200, "Device successfully turned OFF", "Failed to turn OFF");

}

module.exports = testDevices;
