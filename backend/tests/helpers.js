// tests/helpers.js
const API_URL = "http://localhost:5000/api";
let globalToken = "";

const assert = (condition, successMsg, errorMsg) => {
    if (condition) {
        console.log(`  ✅ PASS: ${successMsg}`);
    } else {
        console.error(`  ❌ FAIL: ${errorMsg}`);
    }
};

const setToken = (token) => { globalToken = token; };
const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${globalToken}`
});

module.exports = { API_URL, assert, setToken, getAuthHeaders };