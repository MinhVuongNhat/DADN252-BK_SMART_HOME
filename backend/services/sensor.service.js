const { Sensor, SensorData, LatestSensorValue } = require('../models/Sensor');

// Lấy danh sách tất cả cảm biến của User đó
const getMySensors = async (userId) => {
    return await Sensor.findAll({ where: { user_id: userId } });
};

// Lấy giá trị mới nhất của 1 loại cảm biến (nhiệt độ/độ ẩm) thuộc User đó
const getLatestValue = async (userId, type) => {
    const sensor = await Sensor.findOne({ where: { user_id: userId, type: type } });
    if (!sensor) throw new Error('Không tìm thấy cảm biến này của bạn');

    return await LatestSensorValue.findOne({
        where: { sensor_id: sensor.sensor_id }
    });
};

// Lấy lịch sử 20 bản ghi để vẽ biểu đồ cho User đó
const getSensorHistory = async (userId, type, limit = 20) => {
    const sensor = await Sensor.findOne({ where: { user_id: userId, type: type } });
    if (!sensor) throw new Error('Không tìm thấy cảm biến này của bạn');

    return await SensorData.findAll({
        where: { sensor_id: sensor.sensor_id },
        limit: limit,
        order: [['recorded_at', 'DESC']]
    });
};

module.exports = { getMySensors, getLatestValue, getSensorHistory };