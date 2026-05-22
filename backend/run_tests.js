// run_all_tests.js
const testAuth = require('./tests/uc1_auth');
const testMonitoring = require('./tests/uc2_monitoring');
const testAutomation = require('./tests/uc3_automation');
const testDevices = require('./tests/uc4_device');
const testLogsAndAlerts = require('./tests/uc5_6_logs_alerts');
const testSchedules = require('./tests/uc7_schedules');

async function runTestSuite() {
    console.log("🚀 STARTING COMPLETE MODULAR TEST SUITE...\n");

    try {
        // Run Auth first.
        const isLoggedIn = await testAuth();
        if (!isLoggedIn) {
            console.error("\n❌ Aborting remaining tests: Authentication failed.");
            return;
        }

        // Run all branch tests sequentially
        await testMonitoring();
        await testAutomation();
        await testDevices();
        await testLogsAndAlerts();
        await testSchedules();

        console.log("\n🎉 ALL MODULAR TESTS COMPLETED!");
    } catch (error) {
        console.error("\n❌ FATAL TEST ERROR:", error.message);
    }
}

runTestSuite();