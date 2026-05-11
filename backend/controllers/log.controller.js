const db = require('../config/db'); 

const logController = {
    // 1. Lấy danh sách lịch sử (Có phân trang và Join)
    getAllLogs: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Truy vấn lấy dữ liệu kèm thông tin User/Device
            const query = `
                SELECT 
                    l.log_id,
                    l.action_type,
                    l.description,
                    l.created_at,
                    u.username AS user_name,
                    d.name AS device_name,
                    CASE 
                        WHEN l.device_id IS NOT NULL THEN 'DEVICE'
                        WHEN l.user_id IS NOT NULL THEN 'USER'
                        ELSE 'SYSTEM'
                    END AS source_type
                FROM activity_logs l
                LEFT JOIN users u ON l.user_id = u.user_id
                LEFT JOIN devices d ON l.device_id = d.device_id
                ORDER BY l.created_at DESC
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
            `;

            // Truy vấn tổng số dòng để phân trang
            const countQuery = `SELECT COUNT(*) as total FROM activity_logs`;

            const [results, countResult] = await Promise.all([
                db.execute(query),
                db.execute(countQuery)
            ]);

            const total = countResult[0].total;

            res.status(200).json({
                success: true,
                data: results.map(log => ({
                    log_id: log.log_id,
                    source: log.source_type === 'DEVICE' ? log.device_name : log.user_name,
                    source_type: log.source_type,
                    action_type: log.action_type,
                    description: log.description,
                    created_at: log.created_at
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Hàm tạo Log mới (Có thể export để dùng trong các file khác như auth.js hay device.js)
    internalCreateLog: async (logData) => {
        const { userId, deviceId, actionType, description } = logData;
        const query = `
            INSERT INTO activity_logs (user_id, device_id, action_type, description)
            VALUES (${userId || 'NULL'}, ${deviceId || 'NULL'}, N'${actionType}', N'${description}')
        `;
        return await db.execute(query);
    }
};

module.exports = logController;