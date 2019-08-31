import React, { useCallback, useState, Fragment } from 'react';

import SearchBar from './src/SearchBar/SearchBar'
import PlaceSheet from './src/PlaceSheet/PlaceSheet'
import NTUMap from './src/NTUMap/NTUMap'

const App = () => {
  const [location, setLocation] = useState(null)
  const [route, setRoute] = useState(null)

  const onSheetClose = useCallback(() => setLocation(null))

  return (
    <Fragment>
      <NTUMap location={location} route={route} />
      <PlaceSheet location={location} onClose={onSheetClose} route={route} setRoute={setRoute} />
      <SearchBar onLocationSelect={setLocation} />
    </Fragment>
  )
}

export default App;
