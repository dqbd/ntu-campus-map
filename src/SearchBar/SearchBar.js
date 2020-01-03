import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    bottom: 180,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  activeContainer: {
    elevation: 5,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
  },
  searchContainer: {
    borderRadius: 30,
    elevation: 5,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    margin: 20,
    marginBottom: 9,
  },
  searchList: {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  searchListInner: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  text: {
    margin: 0,
    padding: 0,
    flexGrow: 1,
  },
  icon: {
    padding: 12,
  },
  item: {
    // backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    padding: 12,
    paddingStart: 20,
    paddingEnd: 20,
  },
});

const isQueryValid = text => Boolean(text && text.trim());

const requestData = async (text, callback) => {
  if (!isQueryValid(text)) return callback({text, result: []});
  const data = await fetch(
    `http://maps.ntu.edu.sg/a/search?q=${encodeURIComponent(text)}`,
  ).then(a => a.json());
  let result = [];

  if (data && data.what) {
    const business = (data.what.businesses || []).map(i => [
      i.name,
      i.location.geometry.location,
    ]);
    const markers = (data.what.markers || []).map(i => [i.tooltip, i.latlng]);

    result = result.concat(business).concat(markers);
  }

  result.sort(([a], [b]) => a.localeCompare(b));
  callback({text, result});
};

export default ({onLocationSelect}) => {
  const [query, setQuery] = useState(null);
  const queryRef = useRef(query);
  const inputRef = useRef(null);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const resultReceiver = useCallback(
    ({text, result}) => {
      if (text === queryRef.current) {
        setResults(result);
        setLoading(false);
      }
    },
    [queryRef],
  );

  const handleText = useCallback(
    text => {
      setQuery(text);

      // need to get a reference to text, not sure if there is a better way, bodged this one
      queryRef.current = text;

      setLoading(isQueryValid(text));
      requestData(text, resultReceiver);
    },
    [resultReceiver],
  );

  const handleRenderItem = useCallback(
    ({item: [name, [lat, lng]], index}) => {
      return (
        <TouchableNativeFeedback
          onPress={() => {
            handleText(null);
            inputRef.current && inputRef.current.blur();
            onLocationSelect({name, lat, lng});
          }}>
          <View style={styles.item}>
            <Text>{name}</Text>
          </View>
        </TouchableNativeFeedback>
      );
    },
    [handleText, onLocationSelect],
  );
  
  const hasText = !!(query && query.trim()) 
  const activeList = (results || []).length > 0
    
  return (
    <View style={{ ...styles.container, ...(activeList ? styles.activeContainer : {}) }} pointerEvents="box-none">
      <View style={styles.searchContainer}>
        <Icon name="search" size={26} style={styles.icon} />

        <TextInput
          placeholder="Search..."
          value={query}
          selectionColor="#D71440"
          onChangeText={handleText}
          style={styles.text}
          ref={inputRef}
        />

        {loading && (
          <ActivityIndicator style={styles.icon} size={26} color="#D71440" />
        )}
        {hasText && (
          <View
            style={{
              overflow: 'hidden',
              borderRadius: 100,
            }}>
            <TouchableNativeFeedback onPress={() => handleText(null)}>
              <Icon name="clear" size={26} style={styles.icon} />
            </TouchableNativeFeedback>
          </View>
        )}
      </View>
      {activeList && (
        <View style={styles.searchList}>
          <View
            style={styles.searchListInner}
            pointerEvents={(results || []).length ? 'auto' : 'none'}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              keyExtractor={([name, loc]) => [name, ...loc].join()}
              data={results || []}
              renderItem={handleRenderItem}
            />
          </View>
        </View>
      )}
    </View>
  );
};
