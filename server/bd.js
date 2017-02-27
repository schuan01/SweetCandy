var PORT = process.env.PORT || 3000;

var server_bd_port = 3306;
var server_bd = 'us-cdbr-iron-east-04.cleardb.net';
var server_user = 'b16fa9963b6b69';
var server_pwd = '5080d557';

var connection;
var mysql = require('mysql');
var pool = null;

var db_config = {
    connectionLimit: 10,
    host: server_bd,
    port: server_bd_port,
    user: server_user,
    password: server_pwd,
    database: 'heroku_85b15da8dca88f7'
};

var db_config_local = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'testnode'
};

//Creamos el pool de la BD
if (PORT == 3000) {
    pool = mysql.createPool(db_config_local);
}
else {
    pool = mysql.createPool(db_config);
}

exports.getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
};    