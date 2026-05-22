// tests/uc7_schedules.js
const { API_URL, assert, getAuthHeaders } = require('./helpers');

async function testSchedules() {
    console.log("\n--- UC7: Schedules Branches ---");
    let testScheduleId = 1; 

    // Branch 1: Create a Schedule
    const createRes = await fetch(`${API_URL}/schedules`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            device_id: 1,
            start_date: "2026-06-01",
            start_time: "18:30",
            end_date: "2026-06-10",
            end_time: "21:30",
            action_type: "turn_on"
        })
    });
    assert(createRes.status === 200 || createRes.status === 201, "Timer schedule created successfully", "Failed to create schedule");

    // Branch 2: Get Schedules (Using the accidentally nested route)
    const getRes = await fetch(`${API_URL}/schedules/devices/1/schedules`, { 
        headers: getAuthHeaders() 
    });
    
    if (getRes.status === 200) {
        assert(true, "Fetched schedules for Device 1 (Targeted nested route)", "");
    } else {
        const errText = await getRes.text();
        assert(false, "", `Failed to fetch device schedules. Status: ${getRes.status}. Server says: ${errText}`);
    }

    // Branch 3: Disable/Toggle Schedule
    const toggleRes = await fetch(`${API_URL}/schedules/${testScheduleId}/active`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: false })
    });
    assert(toggleRes.status === 200, "Schedule successfully toggled OFF", "Failed to toggle schedule");
}

module.exports = testSchedules;