const fetch = require('node-fetch')

fetch('http://baseride.com/routes/apigeo/routevariantvehicle/44481/?format=json').then(a => a.json()).then(console.log)