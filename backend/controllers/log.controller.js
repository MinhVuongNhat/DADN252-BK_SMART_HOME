const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

const logController = {

    // 1. Lấy danh sách lịch sử
    getAllLogs: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const searchTerm = req.query.search ? `%${req.query.search}%` : null;

            let whereClause = '';
            if (searchTerm) {
                whereClause = `
                    WHERE l.description LIKE :search 
                    OR l.action_type LIKE :search
                `;
            }

            // ✅ MSSQL dùng OFFSET FETCH (KHÔNG dùng LIMIT)
            const query = `
                SELECT 
                    l.log_id, l.action_type, l.description, l.created_at,
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
                ${whereClause}
                ORDER BY l.created_at DESC
                OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            `;

            const countQuery = `
                SELECT COUNT(*) as total 
                FROM activity_logs l
                ${whereClause}
            `;

            // chạy song song
            const [results, countResult] = await Promise.all([
                sequelize.query(query, {
                    replacements: { search: searchTerm, offset, limit },
                    type: QueryTypes.SELECT
                }),
                sequelize.query(countQuery, {
                    replacements: { search: searchTerm },
                    type: QueryTypes.SELECT
                })
            ]);

            const total = countResult[0].total;

            res.status(200).json({
                success: true,
                data: results.map(log => ({
                    log_id: log.log_id,
                    source: log.device_name || log.user_name || "System",
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
            console.error("Log Controller Error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Tạo log mới
    internalCreateLog: async (logData) => {
        try {
            const { userId, deviceId, actionType, description } = logData;

            const query = `
                INSERT INTO activity_logs (user_id, device_id, action_type, description)
                VALUES (:userId, :deviceId, :actionType, :description)
            `;

            return await sequelize.query(query, {
                replacements: {
                    userId: userId || null,
                    deviceId: deviceId || null,
                    actionType,
                    description
                },
                type: QueryTypes.INSERT
            });

        } catch (error) {
            console.error("Internal Create Log Error:", error);
        }
    }
};

module.exports = logController;