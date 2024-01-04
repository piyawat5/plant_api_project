const mysql = require("mysql2");
require("dotenv").config();

//connection mysql2
config = {
  connectionLimit: 100,
  host: process.env.HOST_MYSQL,
  user: process.env.USER_MYSQL,
  password: process.env.PASSWORD_MYSQL,
  database: process.env.DATABASE_MYSQL,
  port: process.env.PORT_MYSQL,
};

pool = mysql.createPool(config);

module.exports = pool;
