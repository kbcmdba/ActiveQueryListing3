
const mariadb = require( 'mariadb' )

var db_config = {
    host: null,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    allowPublicKeyRetrieval: true
}

/* var connection = {}
 *
 * function handleDisconnect( hostname ) {
 *     db_config[ 'host' ] = hostname
 *     connection[ hostname ] = mariadb.createConnection( db_config ) // Recreate the connection, since the old one is unusable.
 *
 *     connection[ hostname ].connect( function( err ) {              // The server is either down
 *         if( err ) {                                                // or restarting (takes a while sometimes).
 *             console.log( 'Error when connecting to db:', err )
 *             setTimeout( handleDisconnect, 2000 )                   // We introduce a delay before attempting to reconnect,
 *         }                                                          // to avoid a hot loop, and to allow our node script to
 *     } )                                                            // process asynchronous requests in the meantime.
 *                                                                    // If you're also serving http, display a 503 error.
 *     connection[ hostname ].on( 'error', function( err ) {
 *         console.log( 'DB error', err ) 
 *         if( err.code === 'PROTOCOL_CONNECTION_LOST' ) {            // Connection to the MySQL server is usually
 *             handleDisconnect()                                     // lost due to either server restart, or a
 *         } else {                                                   // connnection idle timeout (the wait_timeout
 *             throw err                                              // server variable configures this)
 *         }
 *     } )
 * }
 */

async function _doMySQLStatement( hostname, statement ) {
    var results = []
    db_config[ 'host' ] = hostname
    await Promise.all([ mariadb.createConnection( db_config )
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

async function getHostList() {
    host = process.env.DB_HOST
    sql = 'SELECT hostname FROM aql3_db.host ' +
           'WHERE should_monitor = 1 AND decommissioned = 0'
    return( await _doMySQLStatement( host, sql ) )
}

async function getProcessList( hostname ) {
    return( await _doMySQLStatement( hostname, "SHOW FULL PROCESSLIST" ) )
}

async function getReplicationStatus( hostname ) {
    return( await _doMySQLStatement( hostname, "SHOW SLAVE STATUS" ) )
}

async function getUptime( hostname ) {
     return( await _doMySQLStatement( hostname, "SHOW GLOBAL STATUS LIKE 'uptime'" ) )
}

module.exports = {
    getHostList: getHostList,
    getProcessList: getProcessList,
    getReplicationStatus: getReplicationStatus,
    getUptime: getUptime
}

// The AQL user will need the ability to check the slave status on each of the
// hosts it checks.

// TODO: Make AQL able to not have slave status capability and still be able to
// collect statistics on slaves / non-slaves for everything except slave stats.

