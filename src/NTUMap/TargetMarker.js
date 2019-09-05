import React from 'react'
import MapboxGL from "@react-native-mapbox-gl/maps"

export const TargetMarker = ({ location }) => {
  const { name, lat, lng } = location || {}
  if (!name || !lat || !lng) return null

  return (
    <MapboxGL.ShapeSource id={`${name}-shapesource`} shape={{
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
    }}>
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
