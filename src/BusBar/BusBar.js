import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { TouchableNativeFeedback, StyleSheet, View } from 'react-native'
import { LINES } from '../../constants'

export const BAR_HEIGHT = 52.6 + 40

const styles = StyleSheet.create({
  bus: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
})
export default ({ setRoute, route }) => {
  return (
    <View style={styles.bus}>
      {LINES.map((line, index) => {
        const active = !!(route && route.value === line.value)
        return (
          <TouchableNativeFeedback
            key={line.value}
            onPress={() => setRoute(active ? null : line)}
          >
            <View
              style={{
                padding: 10,
                borderRadius: 100,
                backgroundColor: !active ? "#fff" : line.color,
                elevation: 5,
                marginRight: index !== LINES.length - 1 ? 10 : 0,
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
        )
      })}
    </View>
  )
}