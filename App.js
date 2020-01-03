import React, { useCallback, useState, Fragment } from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'

import SearchBar from './src/SearchBar/SearchBar'
import PlaceSheet from './src/PlaceSheet/PlaceSheet'
import NTUMap from './src/NTUMap/NTUMap'

const App = () => {
  const [location, setLocation] = useState(null)
  const [route, setRoute] = useState(null)
  const [progress, setProgress] = useState(true)

  const onSheetClose = useCallback(() => setLocation(null))

  return (
    <Fragment>
      <NTUMap location={location} route={route} progress={progress} />
      <SearchBar onLocationSelect={setLocation} />
      <PlaceSheet location={location} onClose={onSheetClose} route={route} setRoute={setRoute} progress={progress} setProgress={setProgress} />
    </Fragment>
  )
}

export default App;
