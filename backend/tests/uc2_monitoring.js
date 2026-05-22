// tests/uc2_monitoring.js
const { API_URL, assert, getAuthHeaders } = require('./helpers');

async function testMonitoring() {
    console.log("\n--- UC2: Real-time Monitoring Branches ---");

    // Branch 1: Fetch Latest Data (Real-time sync)
    const latestRes = await fetch(`${API_URL}/sensors/latest/temperature`, { 
        headers: getAuthHeaders() 
    });
    assert(latestRes.status === 200, "Successfully fetched latest temperature reading", "Failed to fetch latest data");

    // Branch 2: Fetch History Data (For charts)
    const historyRes = await fetch(`${API_URL}/sensors/history/temperature`, { 
        headers: getAuthHeaders() 
    });
    assert(historyRes.status === 200, "Successfully fetched historical sensor data", "Failed to fetch history data");
}

module.exports = testMonitoring;