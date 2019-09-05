import SphericalMercator from '@mapbox/sphericalmercator'

const mercator = new SphericalMercator({
  size: 256
})

const degree = (1.125279752 * 1.6) * Math.PI / 180
const [sin, cos] = [Math.sin(degree), Math.cos(degree)]
const centerLL = [
  103.68102550506592,
  1.3494340578071982
]

export const rotateMatch = (srcLL) => {
  const [centerX, centerY] = mercator.forward(centerLL)
  const [srcX, srcY] = mercator.forward(srcLL)
  const [vX, vY] = [srcX - centerX, srcY - centerY]

  // perform actual rotation
  const [vrX, vrY] = [vX * cos - vY * sin, vX * sin + vY * cos]
  const targetXY = [centerX + vrX, centerY + vrY]

  return mercator.inverse(targetXY)
}
