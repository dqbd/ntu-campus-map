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

const BusRouteMarkers = ({ route }) => {
  if (!route) return null

  const url = busMapping[route.value]
  const stations = stops[route.value]
  
  if (!url || !stations) return null
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
    </Fragment>
  )
}

export default ({ location, route }) => {
  const [mapReady, setMapReady] = useState(false)
  const [pinIcon, setPinIcon] = useState(null)
  const [busIcons, setBusIcons] = useState({})

  useEffect(() => {
    (async () => {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      setPinIcon(await Icon.getImageSource('location-on', 32, 'red'))

      setBusIcons(
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
                ...busIcons,
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
