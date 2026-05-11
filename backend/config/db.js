const { Sequelize } = require("sequelize");
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME || "smarthome",      // đúng với database trong script SQL
  process.env.DB_USER,      // login SQL Server
  process.env.DB_PASSWORD,     // password
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mssql",
    port: parseInt(process.env.DB_PORT) || 1433,

  dialectOptions: {
    options: {
      trustServerCertificate: true,
    },
  },
});

module.exports = sequelize;