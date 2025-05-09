if (process.env.MONGO_URI) module.exports = require('./mongo');
else if (process.env.MYSQL_HOST) module.exports = require('./mysql');
else module.exports = require('./sqlite');
