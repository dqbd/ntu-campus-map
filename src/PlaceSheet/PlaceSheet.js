import React, { useEffect, useState, useCallback, useRef, Fragment } from 'react'
import cheerio from 'react-native-cheerio'
import BottomSheet from 'reanimated-bottom-sheet'
import BusBar, { BAR_HEIGHT } from '../BusBar/BusBar'

import { ActivityIndicator, StyleSheet, View, Text, ScrollView, Dimensions, Linking } from 'react-native'
import Animated from 'react-native-reanimated'

import HTML from 'react-native-render-html'
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

export const SHEET_HEIGHT = 112 + 42 + 10

const styles = StyleSheet.create({
  sheet: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    // backgroundColor: '#fff',
    // borderTopLeftRadius: 8,
    // borderTopRightRadius: 8,
    // padding: 20,
    // paddingBottom: 0,
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
  }
})

const requestData = async ({ name, lat, lng }, callback) => {
  const url = `http://maps.ntu.edu.sg/a/search?q=${encodeURIComponent(name)}&ll=${encodeURIComponent([lat, lng].join(','))}`
  const data = await (fetch(url).then(a => a.json()))
  const html = data && data.where && data.where.html
  
  console.log(url)

  let title = null
  let rest = null
  let floorplan = null

  if (data.what && data.what.businesses && data.what.businesses.length === 1) {
    const business = data.what.businesses[0]
    
    title = business.name
    rest = [business.location && business.location.formatted_address, business.unit_number].filter(Boolean).join('\n')

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

  Animated.useCode(
    Animated.onChange(
      callbackNode.current,
      Animated.block([
        Animated.cond(
          Animated.greaterOrEq(callbackNode.current, 1),
          Animated.call([], () => {
            onClose && onClose()
          })
        ),
      ])
    ),
    [onClose]
  )
  
  const { name, lat, lng } = location || {}

  return (
    <View style={styles.sheet} pointerEvents="box-none">
      <BottomSheet
        snapPoints={[BAR_HEIGHT, BAR_HEIGHT + SHEET_HEIGHT, Dimensions.get("window").height - SHEET_HEIGHT]}
        ref={sheetRef}
        initialSnap={0}
        callbackNode={callbackNode.current}
        overdragResistanceFactor={10}
        enabledGestureInteraction={!!location}
        renderHeader={() => {
          return (
            <View>
              <BusBar setRoute={setRoute} route={route} />
              <View style={styles.header}>
                <Text style={styles.heading}>{(details && details.title) || name}</Text>
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
                <HTML
                  html={details.html}
                  onLinkPress={(event, href, attr)=>{
                    if (href !== '/') return Linking.openURL(href)

                    if (attr.class && attr.class.includes("fp") && attr.uid) {
                      Linking.openURL(`http://maps.ntu.edu.sg/static/floorplans/${encodeURIComponent(attr.uid)}.gif`)
                    }
                    
                  }}
                  tagsStyles={{
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

                      node.attribs = { ...(node.attribs || {}), href: node.href || '/', 'class': 'cat' }
                      return node
                    }
                  }}
                />
              )}
            </View>
          )
        }}
      />
    </View>
  )
}