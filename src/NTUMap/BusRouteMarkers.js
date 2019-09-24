import React, { Fragment } from 'react'
import MapboxGL from "@react-native-mapbox-gl/maps"
import stops from '../../data/stops.json'
import { ProgressMarkers } from './ProgressMarkers'

import { LINES } from '../../constants'

const busMapping = {
  'CL-B': "https://gothere.sg/static/ntu/v3/1/{z}/{x}/{y}.png",
  'CL-R': "https://gothere.sg/static/ntu/v3/2/{z}/{x}/{y}.png",
  'CR': "https://gothere.sg/static/ntu/v3/3/{z}/{x}/{y}.png",
  'CWR': "https://gothere.sg/static/ntu/v3/4/{z}/{x}/{y}.png",
}

const busProgressMapping = {
  'CL-B': 44479,
  'CL-R': 44478,
  'CR': 44480,
  'CWR': 44481
}

export const BusRouteMarkers = ({ route, progress }) => {
  return (
    <Fragment key={route && route.value}>
      {!!route && (
        <Fragment>
          <MapboxGL.RasterSource id={`ntumap-${route.value}`} key={route.value} url={busMapping[route.value]} tileSize={128}>
            <MapboxGL.RasterLayer id={`ntumap-${route.value}-layer`} style={{ rasterOpacity: 1 }} />
          </MapboxGL.RasterSource>
          <MapboxGL.ShapeSource
            id={`ntumap-${route.value}-stopsrc`}
            shape={{
              type: 'FeatureCollection',
              features: stops[route.value].map(({ name, lat, lng }) => ({
                type: 'Feature',
                properties: {
                  icon: `${route.value}-stop`,
                  name,
                },
                geometry: {
                  type: 'Point',
                  coordinates: [lng, lat],
                }
              }))
            }}
          >
            <MapboxGL.SymbolLayer
              id={`ntumap-${route.value}-stops-pin`}
              style={{
                iconImage: ['get', 'icon'],
                iconSize: 1,
                iconAnchor: 'bottom',
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
              }}
            />
          </MapboxGL.ShapeSource>

          {!!progress && (
            <ProgressMarkers
              line={route.value}
              color={route.color}
              url={`http://baseride.com/routes/apigeo/routevariantvehicle/${busProgressMapping[route.value]}/?format=json`}
            />
          )}
        </Fragment>
      )}

      {!route && !!progress && LINES.map(line => (
        <ProgressMarkers
          key={line.value}
          line={line.value}
          color={line.color}
          url={`http://baseride.com/routes/apigeo/routevariantvehicle/${busProgressMapping[line.value]}/?format=json`}
        />
      ))}
    </Fragment>
  )
}
