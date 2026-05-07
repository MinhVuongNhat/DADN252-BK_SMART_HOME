const sensorService = require('../services/sensor.service');

const getAllMySensors = async (req, res) => {
    try {
        // req.user được lấy từ Auth Middleware
        const userId = req.user.user_id; 
        const data = await sensorService.getMySensors(userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLatest = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { type } = req.params;
        const data = await sensorService.getLatestValue(userId, type);
        res.json(data);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { type } = req.params;
        const data = await sensorService.getSensorHistory(userId, type);
        res.json(data);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { getAllMySensors, getLatest, getHistory };