import React, { useEffect, useState } from 'react'
import MapboxGL from "@react-native-mapbox-gl/maps"

import { rotateMatch } from './utils'

export const ProgressMarkers = ({ line, color, url }) => {
  const [data, setData] = useState([])
  const [updated, setLastUpdated] = useState(Date.now())

  useEffect(() => {
    if (!url) return
    let fetchId = null
    let cancelled = false
    const delay = 1000
    const fetchCallback = async () => {
      clearTimeout(fetchId)
      let data = null
      try {
        data = await (fetch(url).then(a => a.json()))
      } catch (err) {
        console.log(err)
      }
      if (!cancelled) {
        setData(((data && data.vehicles) || []))
        setLastUpdated(Date.now())
        fetchId = setTimeout(fetchCallback, delay)
      }
    }
    // execute the callback
    fetchCallback();
    return () => {
      cancelled = true
      clearTimeout(fetchId)
    }
  }, [url])

  if (!url) return null

  return (
    <MapboxGL.ShapeSource id={`ntumap-${url}-progresssrc`} shape={{
      type: 'FeatureCollection',
      features: data.map(({ registration_code, bearing, lat, lon }) => ({
        type: 'Feature',
        properties: {
          icon: `${line}-bus`,
          color,
          bearing,
          name: registration_code,
        },
        geometry: {
          type: 'Point',
          coordinates: rotateMatch([lon, lat].map(i => Number.parseFloat(i))),
        }
      }))
    }}>
      <MapboxGL.SymbolLayer
        id={`ntumap-${url}-progress-pin-arrow`}
          style={{
          iconImage: ['get', 'icon'],
          iconRotate: ['get', 'bearing'],
          iconSize: 0.5,
          iconAllowOverlap: false,
          iconIgnorePlacement: true,
        }}
      />
    </MapboxGL.ShapeSource>
  )
}
