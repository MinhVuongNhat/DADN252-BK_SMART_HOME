const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("smarthome", "sa", "123456", {
  dialect: "mssql",
  host: "localhost",
  port: 1433,

  dialectOptions: {
    options: {
      trustServerCertificate: true,
    },
  },
});

module.exports = sequelize;