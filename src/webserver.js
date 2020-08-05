const mariadb = require('mariadb')

const name = 'Kevin'

module.exports = { name, run: () => { console.log(name) } }
