import React, { Fragment, useLayoutEffect, useState, useRef } from 'react';
import MapboxGL from "@react-native-mapbox-gl/maps";
import Icon from 'react-native-vector-icons/MaterialIcons'

import { BusMarkerProvider } from './BusMarkerProvider'

import { StyleSheet, PermissionsAndroid, ActivityIndicator, View } from 'react-native';

import { TargetMarker } from './TargetMarker'
import { BusRouteMarkers } from './BusRouteMarkers'

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

export default ({ location, route }) => {
  const [mapReady, setMapReady] = useState(false)
  const [pinIcon, setPinIcon] = useState(null)
  const [busIcons, setBusIcons] = useState({})

  const shotRef = useRef()

  useLayoutEffect(() => {
    (async () => {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

      setPinIcon(await Icon.getImageSource('location-on', 32, 'red'))
      setBusIcons(await shotRef.current.capture())
      setMapReady(true)
    })()
  }, [])

  return (
    <Fragment>
      <BusMarkerProvider ref={shotRef} />
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
