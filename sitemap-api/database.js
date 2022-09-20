const mysql = require('mysql2');

module.exports = mysql.createConnection({
	host: 'localhost',
	user: 'test',
	password: '375246175we',
	database: `test`
})