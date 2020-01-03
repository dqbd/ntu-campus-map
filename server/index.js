const cheerio = require('cheerio')
const fetch = require('node-fetch')
const fs = require('fs').promises
const open = require('open')
const path = require('path')

const codeMatch = /\((?<code>[0-9]*)\)/
;(async () => {
  const data = await (fetch('http://maps.ntu.edu.sg/a/search?q=bus+stop&ll=1.348447%2C103.684502').then(a => a.json()))
  const markers = data.what.markers.map(i => [i.tooltip, i.latlng, codeMatch.exec(i.tooltip).groups.code]);

  if (markers.some(([,,code]) => !code)) throw Error('No code')

  const res = {}
  
  for (const [name, [lat, lng], code] of markers) {

    
    const { where } = await (fetch(`http://maps.ntu.edu.sg/a/search?q=${encodeURIComponent(`bus stop ${code}`)}&ll=${lat}%2C${lng}`).then(a => a.json()))
    if (where && where.html) {
      const $ = cheerio.load(where.html)
      const campus = $(".busservices append").toArray().map(i => $(i).text().trim())
      const sls = $(".busservices a").toArray().map(i => $(i).text().trim())


      const addStop = (code) => {
        if (!Array.isArray(res[code])) res[code] = []
        res[code].push({ name, lat, lng, campus, sls })
      }  

      campus.forEach(addStop)
      sls.forEach(addStop)
    } else {
      console.log(name, lat, lng, "NOT FOUND")
      throw Error('Not found')
    }
  }
  console.log(res)
  await fs.writeFile('res.json', JSON.stringify(res, null, 2))
  
})()