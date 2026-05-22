// tests/uc1_auth.js
const { API_URL, assert, setToken } = require('./helpers');

async function testAuth() {
    console.log("\n--- UC1: Authentication Branches ---");

    // Branch 0: Signup
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: `tester_${Date.now()}`,
            password: "password123",
            email: `tester_${Date.now()}@smarthome.com`
        })
    });
    assert(signupRes.status === 200 || signupRes.status === 201, "User Registration successful", `Signup failed with status ${signupRes.status}`);

    // Branch 1: Fail Login (Wrong Password)
    const failRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@smarthome.com", password: "wrongpassword" })
    });
    assert(failRes.status === 400 || failRes.status === 401, "Correctly rejected invalid password", "Did not reject invalid password");

    // Branch 2: Success Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@smarthome.com", password: "123456" }) // Ensure this matches your DB
    });
    
    const loginData = await loginRes.json();
    
    if (loginData.accessToken) {
        setToken(loginData.accessToken);
        assert(true, "Login successful & Token received", "");
        return true;
    } else {
        assert(false, "", `Login failed. Server responded with: ${JSON.stringify(loginData)}`);
        return false;
    }
}

module.exports = testAuth;