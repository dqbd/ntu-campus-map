import React, { createRef } from 'react'
import { View, PixelRatio } from "react-native"
import ViewShot from "react-native-view-shot"
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Svg, Path } from "react-native-svg"

import { LINES } from '../../constants'

export class BusMarkerProvider extends React.PureComponent {
  constructor(props) {
    super(props)

    this.busRefs = LINES.reduce((memo, { value }) => {
      memo[value] = createRef()
      return memo
    }, {})
  }


  capture = async () => {
    const res = await Promise.all(
      LINES.map(async ({ value, color }) => {
        const ref = this.busRefs[value]
        return [
          value,
          await ref.current.capture(),
          await Icon.getImageSource('location-on', 32, color)
        ]
      })
    )

    return res.reduce((memo, [value, bus, stop]) => {
      memo[`${value}-bus`] = { uri: bus }
      memo[`${value}-stop`] = stop
      return memo
    }, {})
  }

  render() {
    return (
      <View style={{ position: "absolute", flexDirection: "column", top: -100 }}>
        {LINES.map(({ value, color }) => {
          return (
            <ViewShot key={value} ref={this.busRefs[value]} options={{ format: "png" }}>
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                x="0"
                y="0"
                width={64 / PixelRatio.get()}
                height={64 / PixelRatio.get()}
                version="1.1"
                viewBox="0 0 32 32"
                xmlSpace="preserve"
              >
                <Path fill="#FFFFFF" d="M16,25.6c-5.1,0-9.3-4.2-9.3-9.3c0-2.5,0.9-4.8,2.7-6.5l0.2-0.2L9.5,9.3C9.3,8.6,9.2,8,9.2,7.3
                  c0-3.7,3-6.8,6.8-6.8c3.7,0,6.8,3,6.8,6.8c0,0.7-0.1,1.3-0.3,2l-0.1,0.3l0.2,0.2c1.7,1.8,2.7,4.1,2.7,6.5
                  C25.3,21.4,21.1,25.6,16,25.6z"/>
                <Path d="M16,1c3.5,0,6.3,2.8,6.3,6.3c0,0.6-0.1,1.2-0.3,1.8l-0.2,0.6l0.4,0.4c1.6,1.7,2.5,3.8,2.5,6.2c0,4.9-3.9,8.8-8.8,8.8
                  s-8.8-3.9-8.8-8.8c0-2.3,0.9-4.5,2.5-6.2l0.4-0.4L10,9.1C9.8,8.5,9.7,7.9,9.7,7.3C9.7,3.8,12.5,1,16,1 M16,0c-4,0-7.3,3.3-7.3,7.3
                  C8.7,8,8.8,8.8,9,9.4c-1.7,1.8-2.8,4.2-2.8,6.9c0,5.4,4.4,9.8,9.8,9.8s9.8-4.4,9.8-9.8c0-2.7-1.1-5.1-2.8-6.9
                  c0.2-0.7,0.3-1.4,0.3-2.1C23.3,3.3,20,0,16,0L16,0z" fill={color} />
                <Path d="M16.5,10V4.9l2.8,2.8L20,7l-4-4l-4,4l0.7,0.7l2.8-2.8V10c-2.6,0-4.6,0.4-4.6,2.5v6.3c0,0.6,0.2,1.1,0.6,1.4v1.1
                  c0,0.3,0.3,0.6,0.6,0.6h0.6c0.3,0,0.6-0.3,0.6-0.6v-0.6h5.1v0.6c0,0.3,0.3,0.6,0.6,0.6h0.6c0.3,0,0.6-0.3,0.6-0.6v-1.1
                  c0.4-0.3,0.6-0.8,0.6-1.4v-6.3C21.1,10.5,19.1,10.1,16.5,10z M13.2,19.5c-0.5,0-0.9-0.4-0.9-0.9s0.4-0.9,0.9-0.9
                  c0.5,0,0.9,0.4,0.9,0.9S13.7,19.5,13.2,19.5z M18.8,19.5c-0.5,0-0.9-0.4-0.9-0.9s0.4-0.9,0.9-0.9c0.5,0,0.9,0.4,0.9,0.9
                  S19.4,19.5,18.8,19.5z M19.8,15.7h-7.6v-3.2h7.6V15.7z" fill={color} />
              </Svg>
            </ViewShot>
          )
        })}
      </View>
    )
  }
}
