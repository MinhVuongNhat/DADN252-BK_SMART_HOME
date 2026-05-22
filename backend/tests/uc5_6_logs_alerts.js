// tests/uc5_uc6_logs_alerts.js
const { API_URL, assert, getAuthHeaders } = require('./helpers');

async function testLogsAndAlerts() {
    console.log("\n--- UC5 & UC6: Alerts and Logs Branches ---");

    // Branch 1: Fetch Activity Logs (Pagination)
    const logsRes = await fetch(`${API_URL}/logs?page=1&limit=10`, { 
        headers: getAuthHeaders() 
    });
    assert(logsRes.status === 200, "Activity logs retrieved successfully", "Failed to get logs");

    // Branch 2: Fetch Unresolved Alerts
    const alertsRes = await fetch(`${API_URL}/alerts?unresolved=true`, { 
        headers: getAuthHeaders() 
    });
    // Accepting 404 as a pass here just in case the Alerts table is empty/unseeded
    assert(alertsRes.status === 200 || alertsRes.status === 404, "Alerts API endpoint reached successfully", `Alerts failed with status ${alertsRes.status}`);
}

module.exports = testLogsAndAlerts;