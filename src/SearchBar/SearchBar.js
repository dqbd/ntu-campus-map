import React, { useState, useCallback, useRef } from 'react'
import { View, StyleSheet, Text, TextInput, TouchableNativeFeedback, FlatList, ActivityIndicator } from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    position: 'absolute',
    top: 20,
    bottom: 180,
    left: 20,
    right: 20,
    zIndex: 0,
  },
  searchContainer: {
    borderRadius: 8,
    elevation: 9,
    backgroundColor: '#fff',
    display: "flex",
    flexDirection: 'row',
    marginBottom: 10,
  },
  text: {
    margin: 0,
    padding: 0,
    flexGrow: 1,
  },
  icon: {
    padding: 12,
  },
  list: {
    borderRadius: 8,
    overflow: "hidden",
    elevation: 9,
    backgroundColor: "#fff",
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
  }
})

const isQueryValid = text => Boolean(text && text.trim())

const requestData = async (text, callback) => {
  if (!isQueryValid(text)) return callback({ text, result: [] })
  const data = await (fetch(`http://maps.ntu.edu.sg/a/search?q=${encodeURIComponent(text)}`).then(a => a.json()))
  let result = []

  if (data && data.what) {
    const business = (data.what.businesses || []).map(i => [i.name, i.location.geometry.location])
    const markers = (data.what.markers || []).map(i => [i.tooltip, i.latlng])

    result = result
      .concat(business)
      .concat(markers)
  }
  
  result.sort(([a], [b]) => a.localeCompare(b))
  callback({ text, result })
}

export default ({ onLocationSelect }) => {
  const [query, setQuery] = useState(null)
  const queryRef = useRef(query)
  const inputRef = useRef(null)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const resultReceiver = useCallback(({ text, result }) => {
    if (text === queryRef.current) {
      setResults(result)
      setLoading(false)
    }
  }, [queryRef])

  const handleText = useCallback((text) => {
    setQuery(text)
    
    // need to get a reference to text, not sure if there is a better way, bodged this one
    queryRef.current = text
    
    setLoading(isQueryValid(text))
    requestData(text, resultReceiver)
  }, [resultReceiver])

  const handleRenderItem = useCallback(({ item: [name, [lat, lng]], index }) => {
    return (
      <TouchableNativeFeedback onPress={() => {
        handleText(null)
        inputRef.current && inputRef.current.blur()
        onLocationSelect({ name, lat, lng })
      }}>
        <View
          style={styles.item}
        >
          <Text>{name}</Text>
        </View>
      </TouchableNativeFeedback>
    )
  }, [handleText, onLocationSelect])

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
    >
      <View
        style={styles.searchContainer}
      >
        <Icon name="search" size={26} style={styles.icon} />
        
        <TextInput
          placeholder="Search..."
          value={query}
          onChangeText={handleText}
          style={styles.text}
          ref={inputRef}
        /> 

        {loading && (
          <ActivityIndicator
            style={styles.icon}
            size={26}
            style={styles.icon}
          />
        )}
        <TouchableNativeFeedback
          onPress={() => handleText(null)}
        >
          <Icon name="clear" size={26} style={styles.icon} />
        </TouchableNativeFeedback>
      </View>
      {(results || []).length >= 0 && (
        <View style={styles.list} pointerEvents={(results || []).length ? "auto" : "none"}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            keyExtractor={([name, loc]) => [name, ...loc].join()}
            data={results || []}
            renderItem={handleRenderItem}
          />
        </View>
      )}
    </View>
  )
}

