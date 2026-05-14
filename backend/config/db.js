const { Sequelize } = require("sequelize");
<<<<<<< Updated upstream
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME || "smarthome",      // đúng với database trong script SQL
  process.env.DB_USER,      // login SQL Server
  process.env.DB_PASSWORD,     // password
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mssql",
    port: parseInt(process.env.DB_PORT) || 1433,
=======
const sequelize = new Sequelize("smarthome", "sa", "123456", {
  dialect: "mssql",
  host: "localhost",
  port: 1433,
>>>>>>> Stashed changes

  dialectOptions: {
    options: {
      trustServerCertificate: true,
    },
  },
});

module.exports = sequelize;