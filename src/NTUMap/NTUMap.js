import React, { Fragment, useEffect, useState } from 'react';
import MapboxGL from "@react-native-mapbox-gl/maps";
import Icon from 'react-native-vector-icons/MaterialIcons'

import stops from '../../data/stops.json'
import { LINES } from '../../constants'

import { StyleSheet, PermissionsAndroid, ActivityIndicator, View } from 'react-native';

MapboxGL.setAccessToken("pk.eyJ1IjoiZGVsb2xkIiwiYSI6ImNpdDh2bTk3azAwMmIyenFkM2p0b2F4dHkifQ.aeKRzxbIUcSDVromSe-tHg");

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
})

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

const TargetMarker = ({ location }) => {
  const { name, lat, lng } = location || {}
  if (!name || !lat || !lng) return null
  return (
    <MapboxGL.ShapeSource
      id={`${name}-shapesource`}
      shape={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: '9d10456e-bdda-4aa9-9269-04c1667d4552',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            }
          }
        ]
      }}
    >
      <MapboxGL.SymbolLayer
        id={`${name}-symbol`}
        style={{
          iconImage: 'pin',
          iconSize: 1,
          iconAnchor: 'bottom',
          iconAllowOverlap: true,
          iconIgnorePlacement: true,
        }}
      />
    </MapboxGL.ShapeSource>
  )
}

const ProgressMarkers = ({ url }) => {
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
    fetchCallback()

    return () => {
      cancelled = true
      clearTimeout(fetchId)
    }
  }, [url])


  if (!url) return null

  return (
    <Fragment>
      <MapboxGL.ShapeSource
        id={`ntumap-${url}-progresssrc`}
        shape={{
          type: 'FeatureCollection',
          features: data.map(({ registration_code, lat, lon }) => ({
            type: 'Feature',
            properties: {
              icon: 'example',
              name: registration_code,
            },
            geometry: {
              type: 'Point',
              coordinates: [lon, lat].map(i => Number.parseFloat(i)),
            }
          }))
        }}
      >
        <MapboxGL.SymbolLayer
          id={`ntumap-${url}-progress-pin`}
          style={{
            iconImage: 'progress',
            iconSize: 1,
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
          }}
        />
      </MapboxGL.ShapeSource>
    </Fragment>
  )
}

const BusRouteMarkers = ({ route }) => {
  if (!route) return null

  const url = busMapping[route.value]
  const stations = stops[route.value]
  const progressId = busProgressMapping[route.value]
  
  if (!url || !stations || !progressId) return null
  return (
    <Fragment key={route.value}>
      <MapboxGL.RasterSource id={`ntumap-${route.value}`} key={route.value} url={url} tileSize={256}>
        <MapboxGL.RasterLayer id={`ntumap-${route.value}-layer`} style={{ rasterOpacity: 1 }} />
      </MapboxGL.RasterSource>
      <MapboxGL.ShapeSource
        id={`ntumap-${route.value}-stopsrc`}
        shape={{
          type: 'FeatureCollection',
          features: stations.map(({ name, lat, lng }) => ({
            type: 'Feature',
            properties: {
              icon: 'example',
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
            iconImage: route.value,
            iconSize: 1,
            iconAnchor: 'bottom',
            iconAllowOverlap: true,
            iconIgnorePlacement: true,
          }}
        />
      </MapboxGL.ShapeSource>

      <ProgressMarkers url={`http://baseride.com/routes/apigeo/routevariantvehicle/${progressId}/?format=json`} />
    </Fragment>
  )
}

export default ({ location, route }) => {
  const [mapReady, setMapReady] = useState(false)
  const [pinIcon, setPinIcon] = useState(null)
  const [stationIcons, setStationIcons] = useState({})
  const [progressIcon, setProgressIcon] = useState(null)

  useEffect(() => {
    (async () => {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      setPinIcon(await Icon.getImageSource('location-on', 32, 'red'))
      setProgressIcon(await Icon.getImageSource('location-on', 14, 'orange'))

      setStationIcons(
        (await Promise.all(LINES.map(({ color }) => Icon.getImageSource('location-on', 32, color))))
        .reduce((res, img, index) => {
          res[LINES[index].value] = img
          return res
        }, {})
      )

      setMapReady(true)
    })()
  }, [])

  
  return (
    <Fragment>
      {mapReady ? (
        <View style={styles.mapContainer}>
          <MapboxGL.MapView style={styles.mapView} compassEnabled={false} minZoomLevel={1}>
            <MapboxGL.Images
              images={{
                pin: pinIcon,
                progress: progressIcon,
                ...stationIcons,
              }}
            />
            <MapboxGL.Camera
              defaultSettings={{
                centerCoordinate: [103.68450164794922, 1.3484472784360202],
                zoomLevel: 14.5,
              }}
              
            />
            
            <MapboxGL.RasterSource id="gothereRS" url="https://gothere.sg/tiles/v14c/{x}/{y}/{z}" tileSize={256}>
              <MapboxGL.RasterLayer id="gothereRSL" />
            </MapboxGL.RasterSource>

            <BusRouteMarkers route={route} />
            <TargetMarker location={location} />
              
            <MapboxGL.UserLocation />
          </MapboxGL.MapView>
        </View>
      ) : <ActivityIndicator size="large" />}
    </Fragment>
  )
}
