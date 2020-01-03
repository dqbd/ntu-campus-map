import React, { Fragment, useLayoutEffect, useState, useRef } from 'react';
import MapboxGL from "@react-native-mapbox-gl/maps";
import Icon from 'react-native-vector-icons/MaterialIcons'

import { BusMarkerProvider } from './BusMarkerProvider'

import { StyleSheet, PermissionsAndroid, ActivityIndicator, View } from 'react-native';

import { TargetMarker } from './TargetMarker'
import { BusRouteMarkers } from './BusRouteMarkers'

const ACCESS_TOKEN = 'pk.eyJ1IjoiZGVsb2xkIiwiYSI6ImNpdDh2bTk3azAwMmIyenFkM2p0b2F4dHkifQ.aeKRzxbIUcSDVromSe-tHg'
MapboxGL.setAccessToken(ACCESS_TOKEN);

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
})

export default ({ location, route, progress }) => {
  const [mapReady, setMapReady] = useState(false)
  const [pinIcon, setPinIcon] = useState(null)
  const [busIcons, setBusIcons] = useState({})

  const shotRef = useRef()
  const cameraRef = useRef()

  useLayoutEffect(() => {
    (async () => {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

      setPinIcon(await Icon.getImageSource('location-on', 32, 'red'))
      setBusIcons(await shotRef.current.capture())
      setMapReady(true)
    })()
  }, [])

  useLayoutEffect(() => {
    if (location && cameraRef.current) {
      const { lat, lng } = location
      cameraRef.current.flyTo([lng, lat], 1000)
    }
  }, [location])

  return (
    <Fragment>
      <BusMarkerProvider ref={shotRef} />
      <View style={styles.mapContainer}>
        {mapReady ? (
          <MapboxGL.MapView
            style={styles.mapView}
            styleURL={encodeURI(
              `https://raw.githubusercontent.com/delold/ntu-campus-map/f47ee4bcda3472935/style.json`,
            )}
            compassEnabled={false}
            minZoomLevel={1}>
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
              maxBounds={{
                ne: [103.6820359, 1.1304753],
                sw: [104.0120359, 1.4504753],
              }}
              ref={cameraRef}
            />

            <BusRouteMarkers progress={progress} route={route} />
            <TargetMarker location={location} />

            <MapboxGL.UserLocation />
          </MapboxGL.MapView>
        ) : (
          <ActivityIndicator size="large" color="#D71440" />
        )}
      </View>
    </Fragment>
  );
}
