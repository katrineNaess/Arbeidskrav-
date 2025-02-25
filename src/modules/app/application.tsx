/*import React, { useEffect, useRef } from 'react'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { useGeographic } from 'ol/proj'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

import 'ol/ol.css'

useGeographic()

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // **LAG 1: Sivile forsvarsregioner (polygons)**
    const SivilforsvarsdistrikterLayer = new VectorLayer({
      source: new VectorSource({
        url: '/ArbeidskravBase/geojson/Sivilforsvarsdistrikter.json',
        format: new GeoJSON(),
      }),
      style: new Style({
        fill: new Fill({ color: 'rgba(255,0,251,0.3)' }),
        stroke: new Stroke({ color: '#0000FF', width: 2 }),
      }),
    })

    // **LAG 2: Nødhus (punkter)**
    const OffentligeTilfluktsromLayer = new VectorLayer({
      source: new VectorSource({
        url: '/ArbeidskravBase/geojson/OffentligeTilfluktsrom.json',
        format: new GeoJSON(),
      }),
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'orange' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    })

    // **Opprett kartet**
    const map = new Map({
      target: mapRef.current!,
      view: new View({ center: [10.8, 59.9], zoom: 6 }),
      layers: [
        new TileLayer({ source: new OSM() }), // Bakgrunnskart
        SivilforsvarsdistrikterLayer, // Polygonlag
        OffentligeTilfluktsromLayer, // Punktlag
      ],
    })

    return () => map.setTarget(undefined) // Cleanup ved unmount
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}*/

import React, { useEffect, useRef } from 'react'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { useGeographic } from 'ol/proj'
import { Style, Fill, Stroke, Icon } from 'ol/style'

import 'ol/ol.css'

useGeographic()

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // **1️⃣ Definer standard- og hover-stiler**
    const defaultPolygonStyle = new Style({
      fill: new Fill({ color: 'rgba(0,157,255,0.3)' }),
      stroke: new Stroke({ color: '#0000FF', width: 2 }),
    })

    const hoverPolygonStyle = new Style({
      fill: new Fill({ color: 'rgba(0,111,255,0.5)' }),
      stroke: new Stroke({ color: '#00bbff', width: 3 }),
    })

    // ✨ Bruker Icon i stedet for CircleStyle
    const defaultPointStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1], // Ikonet posisjoneres med spissen nederst
        src: '/ArbeidskravBase/icons/EmergencyShelter.png', // Path til ikonet
        scale: 0.15, // Mindre størrelse
      }),
    })

    const hoverPointStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: '/ArbeidskravBase/icons/EmergencyShelter.png',
        scale: 0.2, // Litt større ved hover
      }),
    })

    // **2️⃣ Opprett vektorkilder**
    const SivilforsvarsdistrikterSource = new VectorSource({
      url: '/ArbeidskravBase/geojson/Sivilforsvarsdistrikter.json',
      format: new GeoJSON(),
    })

    const OffentligeTilfluktsromSource = new VectorSource({
      url: '/ArbeidskravBase/geojson/OffentligeTilfluktsrom.json',
      format: new GeoJSON(),
    })

    // Opprett lag
    const SivilforsvarsdistrikterLayer = new VectorLayer({
      source: SivilforsvarsdistrikterSource,
      style: defaultPolygonStyle,
    })

    const OffentligeTilfluktsromLayer = new VectorLayer({
      source: OffentligeTilfluktsromSource,
      style: defaultPointStyle,
    })

    // Opprett kartet
    const map = new Map({
      target: mapRef.current!,
      view: new View({ center: [10.8, 59.9], zoom: 6 }),
      layers: [
        new TileLayer({ source: new OSM() }),
        SivilforsvarsdistrikterLayer,
        OffentligeTilfluktsromLayer,
      ],
    })

    // Legg til hover-effekt
    map.on('pointermove', (event) => {
      let hoveredFeature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      )

      // Oppdater stil basert på om musepekeren er over et element
      SivilforsvarsdistrikterLayer.getSource()
        ?.getFeatures()
        .forEach((feature) => {
          feature.setStyle(
            feature === hoveredFeature ? hoverPolygonStyle : defaultPolygonStyle
          )
        })

      OffentligeTilfluktsromLayer.getSource()
        ?.getFeatures()
        .forEach((feature) => {
          feature.setStyle(
            feature === hoveredFeature ? hoverPointStyle : defaultPointStyle
          )
        })
    })

    return () => map.setTarget(undefined) // Cleanup ved unmount
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
