const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "smarthome",      // đúng với database trong script SQL
  "sManager",       // login SQL Server
  "Nhom6251",       // password
  {
    host: "ThuyHien",   // tên SQL Server instance
    dialect: "mssql",
    port: 1433,

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