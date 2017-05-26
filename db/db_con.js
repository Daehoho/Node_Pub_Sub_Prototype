var mysql = require('mysql');
var config = require('../db/db_info')().daou_server;


module.exports = function() {
    // console.log(config);
    return {
        create_pool: function() {
            return mysql.createPool({
                connectionLimit: 50,
                host : config.host,
                user : config.user,
                password : config.password,
                port: config.port,
                database : config.database
            });
        },
        test_open : function (pool) {
            pool.getConnection(function (err, connection) {
                if(err) {
                    console.log('mysql connection error : ' + err);
                } else {
                    console.log('mysql is connected successfully');
                    connection.release();
                }
            })
        }
    }
}