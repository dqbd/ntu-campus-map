const nodeFetch = require('node-fetch')
const { CookieJar } = require('tough-cookie')
const cheerio = require('cheerio')
const qs = require('querystring')
const url = require('url')

const jar = new CookieJar()
const fetch = require('fetch-cookie/node-fetch')(nodeFetch, jar)

const login = async ({ username, password, domain = 'STUDENT' }) => {
  const LOGIN_URL = 'https://ntupcb.ntu.edu.sg/fbscbs'
  const $1 = cheerio.load(await fetch(LOGIN_URL).then(a => a.text()))
  
  const form = $1('form')
  const formValues = $1('*[name]', form).toArray().reduce((memo, item) => {
    const name = $1(item).attr('name')
    if (name && name.trim()) {
      memo[name] = $1(item).attr('value') || ''
    }
    return memo
  }, {})

  formValues['Username'] = username
  formValues['Password'] = password
  formValues['Domain'] = domain

  const targetUrl = url.resolve(LOGIN_URL, form.attr('action'));
  const $2 = cheerio.load(await fetch(targetUrl, {
    method: form.attr('method') || 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify(formValues)
  }).then(a => a.text()))

  if ($2(`[onclick*='SignOut']`).length === 0) {
    console.log('Failed to login via username and password')
    return false
  }

  return true
}

const getAllRooms = async ({ view = 'all' }) => {
  const SPACE_REGEX = /\s{2,}/g
  const COLOR_REGEX = /#\S{3,6}/

  const $3 = cheerio.load(await fetch('https://ntupcb.ntu.edu.sg/fbscbs/PCBooking/SeatingParentForm.aspx').then(a => a.text()))

  const locations = $3(`[name="drplistLocation"] option`).toArray().reduce((memo, item) => {
    const name = $3(item).text().replace(SPACE_REGEX, ' ').trim()
    const value = $3(item).attr('value')
    if (name && value) memo[value] = { name, groups: {} }
    return memo
  }, {})

  for (const locId in locations) {
    const $4 = cheerio.load(await fetch(`https://ntupcb.ntu.edu.sg/fbscbs/PCBooking/SeatingParentForm.aspx?LocId=${encodeURIComponent(locId)}`).then(a => a.text()))

    locations[locId].groups = $4(`[name="drplistpcgrp"] option`).toArray().reduce((memo, item) => {
      const name = $3(item).text().replace(SPACE_REGEX, ' ').trim()
      const value = $3(item).attr('value')
      if (name && value) memo[value] = { name, computers: {} }
      return memo
    }, {})
  }

  for (const locId in locations) {
    for (const pcGroupId in locations[locId].groups) {
      const $5 = cheerio.load(await fetch(`https://ntupcb.ntu.edu.sg/fbscbs/PCBooking/SeatingCentralComputer.aspx?ColCnt=20&RowCnt=20&LocId=${locId}&PcGroupId=${pcGroupId}`).then(a => a.text()))
      
      locations[locId].groups[pcGroupId].computers = $5(`.divOuter[style*='inline'] table`).toArray().reduce((memo, item) => {
        const style = $5('.tdPcColor', item).attr('style')
        const name = $5('.lblPcName', item).text().trim()

        const color = style && style.trim().match(COLOR_REGEX)[0]
        if (color && name) {
          const [status, code] = {
            '#FFFFFF': ['free', 0],
            '#DD1DB0': ['reserved', 1],
            '#0100FE': ['maintenance', 2],
            '#FFD401': ['free access', 3],
            '#868686': ['locked', 4]
          }[color]

          memo[name] = { color, status, code }
        }
        return memo
      }, {})
    }
  }

  return locations
}

const bookComputer = ({ locId, pcGroupId }) => {

}

;(async () => {
  if (await login({ username: 'N1903392D', password: 'Windows8.next' })) {
    console.log(jar.serializeSync())
    // await getAllRooms()
  }
})()