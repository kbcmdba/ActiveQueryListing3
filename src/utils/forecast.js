const request = require('request')

const forecast = (lat, lon, callback) => {
    const url = 'https://api.darksky.net/forecast/6ae248b915d7c4d96aeca66c9f227bad/' + encodeURIComponent(lat) + ',' + encodeURIComponent(lon)

    request({ url: url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to location services.', undefined)
            return
        }
        if (body.error) {
            callback('Unable to find location. Try another search.', undefined)
            return
        }
        const temp = body.currently.temperature
        const perc = body.currently.precipProbability
        const ptype = body.currently.precipType ? response.body.currently.precipType : 'precipitation'
        const summary = body.daily.data[0].summary
        callback(undefined, {
            forecast: summary + ' It is currently ' + temp + ' degrees out. There is a ' + perc + '% chance of ' + ptype + '.'
        })
    })
}

module.exports = forecast
