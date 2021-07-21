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
    console.log(res)
})

redisClient.expire('redisCheck', 3)

redisClient.get('redisCheck', (err, res) => {
    if (err) {
        return( console.log( err ) )
    }
    console.log( res )
})

const appTitle = 'Active Query Listing 3 for MySQL'
const appAuthor = 'Kevin Benton'

// This really should be code that would get the list of available hosts from
// the database server.
const hostList = [ '127.0.0.1', 'rpi6e' ]

const env = nunjucks.configure( [ viewsPath ], {
    autoescape: true, 
    express: app
})

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
        return res.send(JSON.stringify(hostList) + '\n')
    }
    console.log(req.query)
    return res.send(JSON.stringify(hostList) + '\n')
})

async function hostQueryList( host ) {
    var foo = await mymariadb.getProcessList( host )
    return( foo )
}

async function replicationStatus( host ) {
    var foo = await mymariadb.getReplicationStatus( host )
    return( foo )
}

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

app.get('/server-info', async(req, res) => {
    if ( ! req.query.host ) {
        return res.send(JSON.stringify({ error: 'You must provide a search term' }) + '\n')
    }
    console.log( req.query )
    if (! hostList.includes( req.query.host ) ) {
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
    console.log( req.query )
    if (! hostList.includes( req.query.host ) ) {
        return res.send(JSON.stringify({
            error: 'Host not supported.'
        }) + '\n')
    }
    hql = await hostQueryList( req.query.host )
    res.send( JSON.stringify( hql ) + '\n')
})

// Help 404 handler
app.get('/help/*', (req, res) => {
    res.render('404', {
        title: '404',
        errorMsg: 'Help article not found.'
    })
})

// Generic 404 handler
app.get('*', (req, res) => {
    res.render('404', {
        title: '404',
        errorMsg: 'Page not found.'
    })
})

app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})
