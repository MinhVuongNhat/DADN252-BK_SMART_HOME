const { Sequelize } = require("sequelize");
require('dotenv').config(); 

const sequelize = new Sequelize(
  process.env.DB_NAME || "smarthome", 
  process.env.DB_USER || "sa", 
  process.env.DB_PASS || "123456", 
  {
    dialect: process.env.DB_DIALECT || "mssql",
    host: process.env.DB_HOST || "localhost", // Change your .env to DB_HOST=localhost
    port: 1433,
    dialectOptions: {
      options: {
        trustServerCertificate: true,
      },
    },
  }
);

module.exports = sequelize;