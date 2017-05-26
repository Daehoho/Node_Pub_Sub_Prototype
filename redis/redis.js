var redis = require("redis");
var config = require('./redis_info')().local;
var redisClient = redis.createClient(config.port, config.host);

// if (config.password != undefined) {
//     redisClient.auth(config.password, function (err) {
//         if (err) throw err;
//     });
// };
redisClient.auth(config.password, function (err) {
    if (err) throw err;
});
redisClient.on('error', function(err) {
    console.log('Redis error: ' + err);
});

module.exports = redisClient;
