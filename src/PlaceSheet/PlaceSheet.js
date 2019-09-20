import React, { useEffect, useState, useCallback, useRef, Fragment } from 'react'
import cheerio from 'react-native-cheerio'
import BottomSheet from 'reanimated-bottom-sheet'
import BusBar, { BAR_HEIGHT } from '../BusBar/BusBar'

import { ActivityIndicator, StyleSheet, View, Text, Dimensions, Linking } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import Icon from 'react-native-vector-icons/MaterialIcons'
import HTML from 'react-native-render-html'

export const SHEET_HEIGHT = 112 + 42 + 10

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  loading: {
    display: "flex",
    flexDirection: 'row',
    marginTop: 5,
  },
  loadingText: {
    marginLeft: 10,
  },
  heading: {
    fontSize: 24,
    flexGrow: 1,
  },
  rest: {
    fontSize: 16,
  },
  divider: {
    height: 20,
  },
  html: {
    paddingTop: 0,
    paddingBottom: 20,
    maxHeight: Dimensions.get("window").height / 2,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    minHeight: SHEET_HEIGHT,
  },
  content: {
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonPress: {
    elevation: 9,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
  },
  button: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexShrink: 0,
    height: 42,
    borderRadius: 21,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: '#009688',
    
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 42,
    marginTop: 10,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
  }
})

const requestData = async ({ name, lat, lng }, callback) => {
  const url = `http://maps.ntu.edu.sg/a/search?q=${encodeURIComponent(name)}&ll=${encodeURIComponent([lat, lng].join(','))}`
  const data = await (fetch(url).then(a => a.json()))
  const html = data && data.where && data.where.html
  
  let title = null
  let rest = null
  let floorplan = null

  if (data.what && data.what.businesses && data.what.businesses.length === 1) {
    const business = data.what.businesses[0]
    
    title = business.name
    rest = [...((business.location && business.location.formatted_address) || '').split('|'), business.unit_number].filter(Boolean).map(t => t.trim()).join('\n')

    floorplan = (business.more_info && business.more_info.floorplan) || floorplan
  } else {
    const $ = cheerio.load(html)
    title = $(".locf a").text().trim()
    $(".locf").find('br').replaceWith('\n')
    $(".locf").find('strong').remove()
    rest = $(".locf").text().trim().split('\n').map(i => i.trim()).filter(Boolean).join('\n')
  }

  callback({ name, html, title, rest, floorplan })
}

const filteredClasses = ['bar', 'place']

export default ({ location, onClose, setRoute, route }) => {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState(null)
  const [headerHeight, setHeaderHeight] = useState(SHEET_HEIGHT)

  const sheetRef = useRef()
  const callbackNode = useRef(new Animated.Value(1))

  useEffect(() => {
    if (location) {
      sheetRef.current && sheetRef.current.snapTo(1)
      setDetails(null)
      setLoading(true)
      requestData(location, (details) => {
        setLoading(false)
        setDetails(details)


      })
    }
  }, [location])

  const handleClose = useCallback(() => {
    sheetRef.current && sheetRef.current.snapTo(0)
    setDetails(null)
    setLoading(true)
    onClose()
  })
  
  const handleLayout = useCallback((e) => {
    setHeaderHeight(e.nativeEvent.layout.height)
    if (!loading && location) {

      sheetRef.current && sheetRef.current.snapTo(1)
    }
  }, [location, loading])

  const { name, lat, lng } = location || {}

  return (
    <View style={styles.sheet} pointerEvents="box-none">
      <BottomSheet
        snapPoints={[BAR_HEIGHT, BAR_HEIGHT + headerHeight, Dimensions.get("window").height + BAR_HEIGHT - 22]}
        ref={sheetRef}
        initialSnap={0}
        callbackNode={callbackNode.current}
        overdragResistanceFactor={10}
        enabledGestureInteraction={!!location && !loading}
        renderHeader={() => {
          return (
            <View>
              <BusBar setRoute={setRoute} route={route} />
              <View style={styles.header} onLayout={handleLayout}>
                <View
                  style={styles.titleContainer}
                >
                  <Text style={styles.heading}>
                    {(details && details.title) || name}
                  </Text>
                  <TouchableNativeFeedback
                    onPress={handleClose}
                  >
                    <View>
                      <Icon
                        name="close"
                        size={32}
                      />
                    </View>
                  </TouchableNativeFeedback>
                </View>
                {loading && (
                  <View style={styles.loading}>
                    <ActivityIndicator size="small" />
                    <Text style={styles.loadingText}>Loading details</Text>
                  </View>
                )}
                {!!details && (
                  <Fragment>
                    <Text style={styles.rest}>{details.rest}</Text>
                    <View style={styles.actions}>

                      {!!details.floorplan && (
                        <View style={styles.buttonPress}>
                          <TouchableNativeFeedback onPress={() => Linking.openURL(`http://maps.ntu.edu.sg/static/floorplans/${encodeURIComponent(details.floorplan)}.gif`)}>
                            <View style={styles.button}>
                              <Text style={styles.buttonText}>Show Floorplan</Text>
                            </View>
                          </TouchableNativeFeedback>
                        </View>
                      )}
                      <View style={styles.buttonPress}>
                        <TouchableNativeFeedback onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([lat,lng].join(','))}&travelmode=walking`)}>
                          <View style={styles.button}>
                            <Text style={styles.buttonText}>Open in Google Maps</Text>
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    </View>
                  </Fragment>
                )}
                
              </View>
            </View>
          )
        }}
        renderContent={() => {
          return (
            <View style={styles.content}>
              {!!details && (
                <View>
                  <HTML
                    html={details.html}
                    onLinkPress={(e, base, attr)=>{
                      const href = attr.targetHref || '/'
                      if (href !== '/') return Linking.openURL(href)
                      if (attr.class && attr.class.includes("fp") && attr.uid) {
                        Linking.openURL(`http://maps.ntu.edu.sg/static/floorplans/${encodeURIComponent(attr.uid)}.gif`)
                      }
                    }}
                    tagsStyles={{
                      h4: { marginTop: 10, marginBottom: 10 },
                      h5: { marginTop: 5, marginBottom: 5 },
                      h6: { margin: 0 },
                      h7: { margin: 0 },
                      p: { margin: 0 },
                    }}
                    classesStyles={{
                      'amenitiesheader': {
                        display: 'flex',
                        flexDirection: 'row'
                      },
                      'amenitieslist': {
                        marginLeft: 30,
                        marginBottom: 20,
                      },
                      'cat': {
                        marginLeft: 10,
                        marginBottom: 5,
                      },
                    }}
                    ignoreNodesFunction={(node) => {
                      if (node.name === 'div' && node.attribs && node.attribs.class && node.attribs.class.split(" ").find(i => filteredClasses.includes(i))) return true
                      return false
                    }}
                    alterNode={(node) => {
                      if (node.name === 'img') {
                        node.attribs = { ...(node.attribs || {}), src: `http://maps.ntu.edu.sg/${node.attribs.src}` }
                        return node
                      }
  
                      if (node.name === 'a') {
                        if (node.attribs.cat) node.name = 'div'

                        node.attribs = { ...(node.attribs || {}), href: '/', targetHref: node.attribs.href, 'class': `cat ${node.attribs.class || ''}` }
                        return node
                      }
                    }}
                  />
                </View>
              )}
            </View>
          )
        }}
      />
    </View>
  )
}