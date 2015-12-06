var mysql = require('mysql');
var config = {};

config.mysql = {};

config.mysql.host = "";
config.mysql.user = "";
config.mysql.password = "";
config.mysql.database = "";

config.mysql.pool = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

module.exports = config;
