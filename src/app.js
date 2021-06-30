const path = require('path')
const express = require('express')
const nunjucks = require('nunjucks')
const app = express()
const port = process.env.PORT || 8080

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.use( express.static( publicDirectoryPath, {
  dotfiles: 'ignore',
  extensions: ['htm', 'html'],
  index: false
} ) )

const appTitle = 'Active Query Listing 3 for MySQL'
const appAuthor = 'Kevin Benton'

const hostList = [ '127.0.0.1', 'rpi6e' ]

const env = nunjucks.configure( [ viewsPath ], {
    autoescape: true, 
    express: app
})

env.addFilter( 'myFilter', function( obj, arg1, arg2 ) {
    console.log('myFilter', obj, arg1, arg2 )
    // Do smth with obj
    return obj  
})

env.addGlobal( 'myFunc', function( obj, arg1 ) { 
    console.log( 'myFunc', obj, arg1 )
    // Do smth with obj
    return obj
})

env.addGlobal( 'getDate', function( obj ) {
    return new Date().toString()
} )

app.get( '', function( req, res ) {
    res.render( 'index.html.j2', {
        title: appTitle, 
        author: appAuthor,
    } )
})

app.get( '/', function( req, res ) {
    res.render( 'index.html.j2', {
        title: appTitle, 
        author: appAuthor
    } )
})

app.get( '/foo', function( req, res ) {
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
        return res.send(JSON.stringify(hostList) + "\n")
    }
    console.log(req.query)
    return res.send(JSON.stringify(hostList) + "\n")
})


app.get('/server-info', (req, res) => {
    if (!req.query.search) {
        return res.send({
            error: 'You must provide a search term'
        })
    }
    console.log(req.query)
    res.send({
        products: []
    })
})

app.get('/server-queries', (req, res) => {
    if (!req.query.search) {
        return res.send({
            error: 'You must provide a search term'
        })
    }
    console.log(req.query)
    res.send({
        products: []
    })
})

// Help 404 handler
app.get("/help/*", (req, res) => {
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
