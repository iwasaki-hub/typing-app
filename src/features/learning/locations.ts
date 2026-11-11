// Representative locations for learning, not borders or exact geographic centroids.
export const countryLocations: Record<string, readonly [number, number]> = {
  jp: [36, 138], kr: [36, 128], cn: [35, 104], in: [22, 79], th: [15, 101],
  fr: [47, 2], de: [51, 10], it: [43, 12], es: [40, -4], gb: [54, -2],
  ca: [58, -106], us: [39, -98], mx: [23, -102], br: [-14, -52], ar: [-35, -64],
  eg: [27, 30], ke: [0, 38], au: [-25, 134], nz: [-41, 174], fj: [-18, 178],
}
export function globePoint(latitude: number, longitude: number, radius = 1) {
  const lat = latitude * Math.PI / 180
  const lon = longitude * Math.PI / 180
  return [radius * Math.cos(lat) * Math.sin(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.cos(lon)] as const
}
