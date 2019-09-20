import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { StyleSheet, View } from 'react-native'
import { LINES } from '../../constants'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
export const BAR_HEIGHT = 52.6 + 40

const styles = StyleSheet.create({
  bus: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
  buttonWrap: {
    elevation: 5,
    borderRadius: 100,
    overflow: 'hidden',
    marginLeft: 5,
    marginRight: 5,
  }
})
export default ({ setRoute, route }) => {
  return (
    <View style={styles.bus}>
      {LINES.map((line, index) => {
        const active = !!(route && route.value === line.value)
        return (
          <Animated.View
            style={styles.buttonWrap}
          >
            <TouchableNativeFeedback
              key={line.value}
              onPress={() => setRoute(active ? null : line)}
            >
              <View
                style={{
                  padding: 10,
                  backgroundColor: !active ? "#fff" : line.color,
                }}
              >
                <Icon
                  name="directions-bus"
                  size={32}
                  style={{
                    color: active ? '#fff' : line.color,
                  }}
                />
              </View>
            </TouchableNativeFeedback>
          </Animated.View>
        )
      })}
    </View>
  )
}