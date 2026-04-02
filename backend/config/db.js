const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME, // was "smarthome"
  process.env.DB_USER, // was "sManager"
  process.env.DB_PASS, // was "Nhom6251"
  {
    host: process.env.DB_HOST, // was "ThuyHien" <--- THIS IS THE FIX
    dialect: process.env.DB_DIALECT || "mssql",
    port: process.env.DB_PORT || 1433,

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