const path = require('path')
const express = require('express')
const hbs = require('hbs')

const app = express()
const port = process.env.PORT || 8080

const expressOptions = {
  dotfiles: 'ignore',
  extensions: ['htm', 'html'],
  index: false
}
app.use(express.static('public', expressOptions))

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

const appTitle = 'Active Query Listing 3 for MySQL'
const appAuthor = 'Kevin Benton'

const hostList = [ '127.0.0.1', 'rpi6e' ]

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('index', {
        title: appTitle,
        author: appAuthor
    })
})

app.get('/', (req, res) => {
    res.render('index', {
        title: appTitle,
        author: appAuthor
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About AQL3',
        author: appAuthor
    })
})

app.get('/help', (req, res) => {
    res.render('help', {
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
