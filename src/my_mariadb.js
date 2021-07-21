
const mariadb = require( 'mariadb' )

async function _doMySQLStatement( hostname, statement ) {
    var results = []
    await Promise.all([ mariadb.createConnection({ host: hostname,
                                                 database: process.env.DB_NAME,
                                                 user: process.env.DB_USER,
                                                 password: process.env.DB_PASS
    })
    .then(async conn => {
        await Promise.all([ conn.query( statement )
            .then( result => {
                for (var i=0; i<result.length; i++) {
                    results.push( result[ i ] )
                }
            })
            .catch( err => {
                console.log( err )
            }) ])
    })
    .catch( err => {
        console.log( err )
    }) ])
    return( results )
}

async function getProcessList( hostname ) {
    return( _doMySQLStatement( hostname, "SHOW FULL PROCESSLIST" ) )
}

async function getReplicationStatus( hostname ) {
    return( _doMySQLStatement( hostname, "SHOW SLAVE STATUS" ) )
}

async function getUptime( hostname ) {
     return( _doMySQLStatement( hostname, "SHOW GLOBAL STATUS LIKE 'uptime'" ) )
}

module.exports = {
    getProcessList: getProcessList,
    getReplicationStatus: getReplicationStatus,
    getUptime: getUptime
}

// The AQL user will need the ability to check the slave status on each of the
// hosts it checks.

// TODO: Make AQL able to not have slave status capability and still be able to
// collect statistics on slaves / non-slaves for everything except slave stats.

