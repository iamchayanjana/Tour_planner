const mysql = require('mysql')

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'chayan',
    database: 'tour_planner'
})

connection.connect(function(err) {
    if (err)
        throw err

    console.log('Database connected!')
})

module.exports = connection