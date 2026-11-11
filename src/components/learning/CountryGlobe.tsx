import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { planeIcon } from '../../lib/icons'
import type { Country } from '../../features/learning/countries'
import { countryLocations, globePoint } from '../../features/learning/locations'
import { useLocale } from '../../features/locale/useLocale'
import './CountryGlobe.css'

type Land = { features: { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] }

export default function CountryGlobe({ country }: { country: Country }) {
  const { t, locale } = useLocale()
  const host = useRef<HTMLDivElement>(null)
  const focus = useRef<(code: string) => void>(() => {})
  const [failed, setFailed] = useState(false)
  const [mapFailed, setMapFailed] = useState(false)
  const [bordersFailed, setBordersFailed] = useState(false)
  useEffect(() => {
    const container = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) }
    catch { queueMicrotask(() => setFailed(true)); return }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 20)
    camera.position.z = 3.3
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    container.append(renderer.domElement)
    const world = new THREE.Group()
    scene.add(world)
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    function sphere(radius: number, color: number) {
      const geometry = new THREE.SphereGeometry(radius, 64, 40)
      const material = new THREE.MeshBasicMaterial({ color })
      geometries.push(geometry); materials.push(material)
      return new THREE.Mesh(geometry, material)
    }
    const earth = sphere(1, 0x174f68)
    earth.rotation.y = -Math.PI / 2
    world.add(earth)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4e8b9d, transparent: true, opacity: .35 })
    materials.push(lineMaterial)
    let texture: THREE.CanvasTexture | undefined
    function line(points: THREE.Vector3[]) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      geometries.push(geometry)
      world.add(new THREE.Line(geometry, lineMaterial))
    }
    for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 181 }, (_, i) => new THREE.Vector3(...globePoint(lat, i * 2, 1.002))))
    for (let lon = 0; lon < 360; lon += 30) line(Array.from({ length: 91 }, (_, i) => new THREE.Vector3(...globePoint(i * 2 - 90, lon, 1.002))))
    // A camera-facing sprite keeps the airplane readable at every latitude.
    const markerCanvas = document.createElement('canvas')
    markerCanvas.width = 128; markerCanvas.height = 128
    const markerContext = markerCanvas.getContext('2d')!
    const [iconWidth, iconHeight, , , iconPath] = planeIcon.icon
    const iconScale = 104 / Math.max(iconWidth, iconHeight)
    markerContext.translate((128 - iconWidth * iconScale) / 2, (128 - iconHeight * iconScale) / 2)
    markerContext.scale(iconScale, iconScale)
    markerContext.fillStyle = '#ffc46a'
    markerContext.strokeStyle = '#68420f'
    markerContext.lineWidth = 12
    markerContext.lineJoin = 'round'
    for (const path of Array.isArray(iconPath) ? iconPath : [iconPath]) {
      const shape = new Path2D(path)
      markerContext.stroke(shape); markerContext.fill(shape)
    }
    const markerTexture = new THREE.CanvasTexture(markerCanvas)
    markerTexture.colorSpace = THREE.SRGBColorSpace
    const markerMaterial = new THREE.SpriteMaterial({ map: markerTexture, depthWrite: false })
    materials.push(markerMaterial)
    const marker = new THREE.Sprite(markerMaterial)
    marker.scale.set(.16, .16, 1)
    world.add(marker)
    const borders = new THREE.Group()
    world.add(borders)
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffd166 })
    materials.push(borderMaterial)
    let borderData: Record<string, number[][][]> = {}
    let selectedCode = ''
    function updateBorders() {
      for (const child of [...borders.children]) {
        (child as THREE.Line).geometry.dispose()
        borders.remove(child)
      }
      for (const ring of borderData[selectedCode] ?? []) {
        const points: THREE.Vector3[] = []
        for (let i = 0; i < ring.length; i++) {
          const [lon, lat] = ring[i]
          const [nextLon, nextLat] = ring[(i + 1) % ring.length]
          const a = new THREE.Vector3(...globePoint(lat, lon))
          const b = new THREE.Vector3(...globePoint(nextLat, nextLon))
          const steps = Math.max(1, Math.ceil(a.angleTo(b) / (Math.PI / 180)))
          for (let step = 0; step < steps; step++) points.push(a.clone().lerp(b, step / steps).normalize().multiplyScalar(1.009))
        }
        borders.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), borderMaterial))
      }
    }
    // XYZ applies longitude first, then latitude, with no screen-facing roll.
    world.rotation.order = 'XYZ'
    let targetLatitude = 0
    let targetLongitude = 0
    let moving = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    function draw() { renderer.render(scene, camera) }
    function animate() {
      if (document.hidden) return
      const difference = Math.atan2(Math.sin(targetLongitude - world.rotation.y), Math.cos(targetLongitude - world.rotation.y))
      const latitudeDifference = targetLatitude - world.rotation.x
      world.rotation.x += latitudeDifference * .09
      world.rotation.y += difference * .09
      if (Math.abs(difference) < .001 && Math.abs(latitudeDifference) < .001) {
        world.rotation.set(targetLatitude, targetLongitude, 0); renderer.setAnimationLoop(null); moving = false
      }
      draw()
    }
    focus.current = code => {
      selectedCode = code; updateBorders()
      const [latitude, longitude] = countryLocations[code]
      const direction = new THREE.Vector3(...globePoint(latitude, longitude))
      marker.position.copy(direction).multiplyScalar(1.025)
      // Center the representative location while keeping geographic north upward.
      targetLatitude = latitude * Math.PI / 180
      targetLongitude = -longitude * Math.PI / 180
      if (reduced.matches) { world.rotation.set(targetLatitude, targetLongitude, 0); draw() }
      else { moving = true; renderer.setAnimationLoop(animate) }
    }
    function resize() {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height; camera.updateProjectionMatrix(); draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    const abort = new AbortController()
    let disposed = false
    void fetch('/maps/country-borders.json', { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('borders')
      return response.json() as Promise<Record<string, number[][][]>>
    }).then(data => {
      if (disposed) return
      borderData = data; updateBorders(); draw()
    }).catch(error => { if (!disposed && error.name !== 'AbortError') setBordersFailed(true) })
    void fetch('/maps/land.geojson', { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('map')
      return response.json() as Promise<Land>
    }).then(data => {
      if (disposed) return
      const canvas = document.createElement('canvas')
      canvas.width = 2048; canvas.height = 1024
      const context = canvas.getContext('2d')!
      context.fillStyle = '#174f68'; context.fillRect(0, 0, 2048, 1024)
      context.fillStyle = '#9ccfb0'
      for (const feature of data.features) {
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as number[][][]] : feature.geometry.coordinates as number[][][][]
        for (const rings of polygons) {
          context.beginPath()
          for (const ring of rings) {
            ring.forEach(([lon, lat], index) => {
              const x = (lon + 180) / 360 * 2048
              const y = (90 - lat) / 180 * 1024
              if (index === 0) context.moveTo(x, y); else context.lineTo(x, y)
            })
            context.closePath()
          }
          context.fill('evenodd')
        }
      }
      texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      earth.material.color.set(0xffffff)
      earth.material.map = texture; earth.material.needsUpdate = true
      draw()
    }).catch(error => { if (!disposed && error.name !== 'AbortError') setMapFailed(true) })
    function visibility() { if (document.hidden) renderer.setAnimationLoop(null); else if (moving) renderer.setAnimationLoop(animate); else draw() }
    function motionChange() { if (reduced.matches) { world.rotation.set(targetLatitude, targetLongitude, 0); moving = false; renderer.setAnimationLoop(null); draw() } }
    function contextLost(event: Event) { event.preventDefault(); setFailed(true); renderer.setAnimationLoop(null) }
    document.addEventListener('visibilitychange', visibility)
    reduced.addEventListener('change', motionChange)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    resize()
    return () => {
      disposed = true; abort.abort(); observer.disconnect(); renderer.setAnimationLoop(null)
      document.removeEventListener('visibilitychange', visibility)
      reduced.removeEventListener('change', motionChange)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      borders.children.forEach(child => (child as THREE.Line).geometry.dispose())
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose())
      markerTexture.dispose(); texture?.dispose(); renderer.dispose(); renderer.domElement.remove(); focus.current = () => {}
    }
  }, [])
  useEffect(() => { focus.current(country.code) }, [country.code])
  return <aside className="country-globe" aria-label={t('出題中の国の位置')}>
    <span className="country-globe-eyebrow">EXPLORE THE WORLD</span>
    <h3>{t('地球で場所を見てみよう')}</h3>
    <div ref={host} className="country-globe-canvas" aria-hidden="true" hidden={failed} />
    {failed && <p role="status">{t('このブラウザでは3D地球を表示できません。練習はそのまま続けられます。')}</p>}
    <div className="country-globe-caption"><img src={`/flags/${country.code}.svg`} width="32" height="22" alt="" /><strong>{country[locale]}</strong><FontAwesomeIcon className="country-globe-plane" icon={planeIcon} aria-hidden="true" /></div>
    <p>{t('マーカーは国の代表的な位置を示しています。')}</p>
    <p>{t('出題中の国の境界を金色の線で表示しています。地図は学習用に簡略化されています。')}</p>
    {bordersFailed && <p role="status">{t('国境線を読み込めませんでした。練習はそのまま続けられます。')}</p>}
    {mapFailed && <p role="status">{t('地図を読み込めませんでした。国の位置のみ表示しています。')}</p>}
    <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Made with Natural Earth</a>
  </aside>
}
