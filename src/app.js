const path = require( 'path' )
const express = require( 'express' )
const app = express()
const nunjucks = require( 'nunjucks' )
const redis = require( 'redis' )

const port = process.env.PORT || 8080
const mymariadb = require( './my_mariadb' )

// Define paths for Express config
const publicDirectoryPath = path.join( __dirname, '../public' )
const viewsPath = path.join( __dirname, '../templates/views' )
const partialsPath = path.join( __dirname, '../templates/partials' )

//
// Set up public directory for static page distribution. Ignore dotfiles and don't auto-index.
//
app.use( express.static( publicDirectoryPath, {
  dotfiles: 'ignore',
  extensions: [ 'htm', 'html' ],
  index: false
} ) )

const redisClient = redis.createClient()
redisClient.on( 'error', ( error ) => {
  console.error( error )
} )

redisClient.set( 'redisCheck', 'allIsWell', ( err, res ) => {
    if ( err ) {
        return( console.log( err ) )
    }
    console.log( 'set.redisCheck', res )
} )

redisClient.expire('redisCheck', 3)

redisClient.get( 'redisCheck', ( err, res ) => {
    if ( err ) {
        return( console.log( err ) )
    }
    console.log( 'get.redisCheck', res )
} )

const myGetHostList = async() => {
    hostListResult = await mymariadb.getHostList()
    return( hostListResult.map( x => x[ 'hostname' ] ) )
}

var customConfig = {
    appTitle: 'Active Query Listing 3 for MySQL',
    hostList: []
}

myGetHostList().then( val => customConfig.hostList = val )

const env = nunjucks.configure( [ viewsPath ], {
    autoescape: true, 
    express: app
} )

const hostQueryList = async( host ) => await mymariadb.getProcessList( host )
const replicationStatus = async( host ) => await mymariadb.getReplicationStatus( host )

//
// Return the number of seconds that a MySQL/MariaDB server has been up
//
async function getUptime( host ) {
    var foo = await mymariadb.getUptime( host )
    return( foo[0].Value )
}

//
// Actually get the host information and stick the data into an object that's returned
//
async function getHostInfo( host ) {
    hql = await hostQueryList( host )
    rs = await replicationStatus( host )
    ut = await getUptime( host )
    return( {
        hostname: host,
        processList: hql,
        replicationStatus: rs,
        upTimeSeconds: ut,
        loadLevel: -1
    } )
}

//
// Register the myFilter function for nunJucks calls
//
env.addFilter( 'myFilter', ( obj, arg1, arg2 ) => {
    console.log('myFilter', obj, arg1, arg2 )
    // Do something with obj
    return obj  
} )

//
// Register the myFunc function for nunJucks calls
//
env.addGlobal( 'myFunc', ( obj, arg1 ) => { 
    console.log( 'myFunc', obj, arg1 )
    // Do something with obj
    return obj
})

//
// Register the getDate function for nunJucks calls
//
env.addGlobal( 'getDate', ( obj ) => {
    return new Date().toString()
} )

/*

    $js['WhenBlock'] .= "$prefix\$.getJSON( \"$baseUrl?hostname=$hostname&alertCritSecs=$alertCritSecs&alertWarnSecs=$alertWarnSecs&alertInfoSecs=$alertInfoSecs&alertLowSecs=$alertLowSecs$debug\")" ;
    $js['ThenParamBlock'] .= "$prefix res$blockNum" ;
    if( count(Tools::params('hosts')) === 1 ) {
        $js['ThenCodeBlock'] = "myCallback( $blockNum, res$blockNum )" ;
    } else {
        $js['ThenCodeBlock'] .= "\n            \$.each(res$blockNum, myCallback) ;" ;
    }

*/

customConfig.whenBlock = '$.getJSON( "http://127.0.0.1:8081/server-queries?host=127.0.0.1&alertCritSecs=60&alertWarnSecs=30&alertInfoSecs=5&alertLowSecs=-1&debug=1" )'
customConfig.thenParamBlock = " res1"
customConfig.thenCodeBlock = "  myCallback( 1, res1 )"

//
// Index
//
app.get( '', ( req, res ) => {
    console.log( 'root:', req.query )
    customConfig.appAuthor = 'Kevin Benton'
    res.render( 'index.html.j2', { config: customConfig } )
} )

//
// Index
//
app.get( '/', ( req, res ) => {
    console.log( 'root:/', req.query )
    customConfig.appAuthor = 'Kevin Benton'
    res.render( 'index.html.j2', { config: customConfig } )
} )

//
// Testing
//
app.get( '/foo', ( req, res ) => {
    res.locals.smthVar = 'This is Sparta!'
    res.render( 'foo.html.j2', { title: 'Foo page' } )    
} )

//
// Tell them about us
//
app.get( '/about', ( req, res ) => {
    res.render( 'about.html.j2', {
        title: 'About AQL3',
        author: customConfig.appAuthor
    } )
} )

//
// Render some help
//
app.get( '/help', ( req, res ) => {
    res.render( 'help.html.j2', {
        title: 'Help Page',
        author: customConfig.appAuthor,
        helpMsg: 'This is some help.'
    } )
} )

//
// Get the list of supported servers
//
app.get( '/server-list', ( req, res ) => {
    if ( ! req.query.search ) {
        return res.send( JSON.stringify( customConfig.hostList ) + '\n' )
    }
    console.log( '/server-list', req.query )
    return res.send( JSON.stringify( customConfig.hostList ) + '\n' )
} )

//
// Get the processlist and replication status from a host
//
app.get( '/server-info', async( req, res ) => {
    if ( ! req.query.host ) {
        return res.send( JSON.stringify( { error: 'You must provide a search term' } ) + '\n' )
    }
    console.log( '/server-info', req.query )
    if ( ! customConfig.hostList.includes( req.query.host ) ) {
        return res.send( JSON.stringify( { error: 'Host not supported.' } ) + '\n' )
    }
    // This is where we could get the show processlist info from the remote host as
    // well as the replication status
    ghi = await getHostInfo( req.query.host )
  res.send( JSON.stringify( ghi ) + '\n')
} )

//
// List the queries on the server.
//
app.get( '/server-queries', async( req, res ) => {
    if ( ! req.query.host ) {
        return res.send( JSON.stringify( { error: 'You must provide a search term' } ) + '\n' )
    }
    console.log( '/server-queries', req.query )
    if ( ! customConfig.hostList.includes( req.query.host ) ) {
        return res.send( JSON.stringify( { error: 'Host not supported.' } ) + '\n' )
    }
    hql = await hostQueryList( req.query.host )
    res.send( JSON.stringify( hql ) + '\n')
} )

//
// Show the slave status(es) on a given server
//
app.get( '/server-slave-status', async( req, res ) => {
    if ( ! req.query.host ) {
        return res.send( JSON.stringify( { error: 'You must provide a search term' } ) + '\n' )
    }
    console.log( '/server-slave-status', req.query )
    if (! customConfig.hostList.includes( req.query.host ) ) {
        return res.send(JSON.stringify({ error: 'Host not supported.' } ) + '\n' )
    }
    rs = await replicationStatus( req.query.host )
    res.send( JSON.stringify( rs ) + '\n')
} )

//
// Help 404 handler
//
app.get( '/help/*', ( req, res ) => {
    res.render( '404.html.j2', {
        title: '404',
        errorMsg: 'Help article not found.'
    } )
} )

//
// Generic 404 handler
//
app.get( '*', ( req, res ) => {
    res.render( '404.html.j2', {
        title: '404',
        errorMsg: 'Page not found.'
    } )
} )

//
// Web server listener
//
app.listen( port, () => {
    console.log('Server is up on port ' + port + '.')
} )
