require('dotenv').config(); // MUST be here to read the .env file

module.exports = {
  // Adafruit IO Configuration
  broker: process.env.MQTT_BROKER || "io.adafruit.com",
  port: process.env.MQTT_PORT || 1883,
  
  // Adafruit IO Credentials (Fixed names to match your .env)
  username: process.env.ADAFRUIT_AIO_USERNAME,
  password: process.env.ADAFRUIT_AIO_KEY, 
  
  // Client Configuration
  clientId: process.env.MQTT_CLIENT_ID || `backend-${Date.now()}`,
  
  // Connection Options
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  keepalive: 60,
};