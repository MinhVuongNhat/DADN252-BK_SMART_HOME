const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "smarthome",
  process.env.DB_USER || "sManager",
  process.env.DB_PASSWORD || "Nhom6251",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mssql",
    port: Number(process.env.DB_PORT) || 1433,

    logging: false,

    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    define: {
      freezeTableName: true,   // Sequelize không tự đổi tên bảng
      timestamps: false,       // vì bảng SQL của bạn không dùng createdAt/updatedAt chuẩn Sequelize
      schema: "dbo"            // bảng của SQL Server nằm trong schema dbo
    }
  }
);

// Test kết nối
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ SQL Server (smarthome) connected successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
  }
}

testConnection();

module.exports = sequelize;