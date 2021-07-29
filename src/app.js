const path = require( 'path' )
const express = require( 'express' )
const nunjucks = require( 'nunjucks' )
const app = express()
const port = process.env.PORT || 8080

// Define paths for Express config
const publicDirectoryPath = path.join( __dirname, '../public' )
const viewsPath = path.join( __dirname, '../templates/views' )
const partialsPath = path.join( __dirname, '../templates/partials' )

app.use( express.static( publicDirectoryPath, {
  dotfiles: 'ignore',
  extensions: [ 'htm', 'html' ],
  index: false
} ) )

const mymariadb = require( './my_mariadb' )
const redis = require( 'redis' )

const redisClient = redis.createClient()

redisClient.on('error', (error) => {
  console.error(error);
});

redisClient.set('redisCheck', 'allIsWell', (err, res) => {
    if (err) {
        return(console.log(err))
    }
    console.log( 'set.redisCheck', res)
})

redisClient.expire('redisCheck', 3)

redisClient.get('redisCheck', (err, res) => {
    if (err) {
        return( console.log( err ) )
    }
    console.log( 'get.redisCheck', res )
})

const appTitle = 'Active Query Listing 3 for MySQL'
const appAuthor = 'Kevin Benton'

const myGetHostList = async() => {
    hostListResult = await mymariadb.getHostList()
    return( hostListResult.map( x => x[ 'hostname' ] ) )
}

var customConfig = {
    hostList: []
}

myGetHostList().then( val => customConfig.hostList = val )

const env = nunjucks.configure( [ viewsPath ], {
    autoescape: true, 
    express: app
})

const hostQueryList = async( host ) => await mymariadb.getProcessList( host )
const replicationStatus = async( host ) => await mymariadb.getReplicationStatus( host )

async function getUptime( host ) {
    var foo = await mymariadb.getUptime( host )
    return( foo[0].Value )
}

async function getHostInfo( host ) {
    hql = await hostQueryList( host )
    rs = await replicationStatus( host )
    ut = await getUptime( host )
    return({
        hostname: host,
        processList: hql,
        replicationStatus: rs,
        upTimeSeconds: ut,
        loadLevel: -1
    })
}

env.addFilter( 'myFilter', ( obj, arg1, arg2 ) => {
    console.log('myFilter', obj, arg1, arg2 )
    // Do something with obj
    return obj  
})

env.addGlobal( 'myFunc', ( obj, arg1 ) => { 
    console.log( 'myFunc', obj, arg1 )
    // Do something with obj
    return obj
})

env.addGlobal( 'getDate', ( obj ) => {
    return new Date().toString()
} )

app.get( '', ( req, res ) => {
    res.render( 'index.html.j2', {
        title: appTitle, 
        author: appAuthor,
    } )
})

app.get( '/', ( req, res ) => {
    res.render( 'index.html.j2', {
        title: appTitle, 
        author: appAuthor
    } )
})

app.get( '/foo', ( req, res ) => {
    res.locals.smthVar = 'This is Sparta!'
    res.render( 'foo.html.j2', { title: 'Foo page' } )    
})

app.get('/about', (req, res) => {
    res.render('about.html.j2', {
        title: 'About AQL3',
        author: appAuthor
    })
})

app.get('/help', (req, res) => {
    res.render('help.html.j2', {
        title: 'Help Page',
        author: appAuthor,
        helpMsg: 'This is some help.'
    })
})

app.get('/server-list', (req, res) => {
    if (!req.query.search) {
        return res.send(JSON.stringify(customConfig.hostList) + '\n')
    }
    console.log( '/server-list', req.query)
    return res.send(JSON.stringify(customConfig.hostList) + '\n')
})

app.get('/server-info', async(req, res) => {
    if ( ! req.query.host ) {
        return res.send(JSON.stringify({ error: 'You must provide a search term' }) + '\n')
    }
    console.log( '/server-info', req.query )
    if (! customConfig.hostList.includes( req.query.host ) ) {
        return res.send(JSON.stringify({
            error: 'Host not supported.'
        }) + '\n')
    }
    // This is where we could get the show processlist info from the remote host as
    // well as the replication status
    ghi = await getHostInfo( req.query.host )
    res.send( JSON.stringify( ghi ) + '\n')
})

app.get('/server-queries', async(req, res) => {
    if ( ! req.query.host ) {
        return res.send(JSON.stringify({ error: 'You must provide a search term' }) + '\n')
    }
    console.log( '/server-queries', req.query )
    if (! customConfig.hostList.includes( req.query.host ) ) {
        return res.send(JSON.stringify({
            error: 'Host not supported.'
        }) + '\n')
    }
    hql = await hostQueryList( req.query.host )
    res.send( JSON.stringify( hql ) + '\n')
})

app.get('/server-slave-status', async(req, res) => {
    if ( ! req.query.host ) {
        return res.send(JSON.stringify({ error: 'You must provide a search term' }) + '\n')
    }
    console.log( '/server-slave-status', req.query )
    if (! customConfig.hostList.includes( req.query.host ) ) {
        return res.send(JSON.stringify({
            error: 'Host not supported.'
        }) + '\n')
    }
    rs = await replicationStatus( req.query.host )
    res.send( JSON.stringify( rs ) + '\n')
})

// Help 404 handler
app.get('/help/*', (req, res) => {
    res.render( '404.html.j2', {
        title: '404',
        errorMsg: 'Help article not found.'
    })
})

// Generic 404 handler
app.get('*', (req, res) => {
    res.render( '404.html.j2', {
        title: '404',
        errorMsg: 'Page not found.'
    })
})

app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})
