import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
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

const BusIcon = ({ name, ...props }) => {
  const IconClass = IconCommunity.hasIcon(name) ? IconCommunity : Icon
  return (
    <IconClass
      name={name}
      {...props}
    />
  )
}

const BusButton = ({ color, onPress, icon, active }) => (
  <Animated.View
    style={styles.buttonWrap}
  >
    <TouchableNativeFeedback
      onPress={onPress}
    >
      <View
        style={{
          padding: 10,
          backgroundColor: !active ? "#fff" : color,
        }}
      >
        <BusIcon
          name={icon}
          size={32}
          style={{
            color: active ? '#fff' : color,
          }}
        />
      </View>
    </TouchableNativeFeedback>
  </Animated.View>
)

export default ({ setRoute, setProgress, progress, route }) => {
  return (
    <View style={styles.bus}>
      {LINES.map((line) => (
        <BusButton
          key={line.value}
          color={line.color}
          icon="directions-bus"
          active={!!(route && route.value === line.value)}
          onPress={() => setRoute(route && route.value === line.value ? null : line)}
        />
      ))}

      <BusButton
        color="#555"
        icon={progress ? "eye" : "eye-off"}
        onPress={() => setProgress(!progress)}
      />
      
    </View>
  )
}