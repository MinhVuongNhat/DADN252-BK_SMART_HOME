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
      trustServerCertificate: true,
    },
  },
});

module.exports = sequelize;