import React, { useEffect, useRef, useState } from 'react'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { useGeographic } from 'ol/proj'
import { Style, Fill, Stroke, Icon } from 'ol/style'
import Overlay from 'ol/Overlay'

import 'ol/ol.css'

useGeographic()

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [popupContent, setPopupContent] = useState<string | null>(null)

  //Stil for sivilforsvardistriktene
  useEffect(() => {
    const defaultPolygonStyle = new Style({
      fill: new Fill({ color: 'rgba(0,157,255,0.3)' }),
      stroke: new Stroke({ color: '#0000FF', width: 2 }),
    })

    //Hover-stil for sivilforsvardistriktene
    const hoverPolygonStyle = new Style({
      fill: new Fill({ color: 'rgba(0,200,255,0.5)' }),
      stroke: new Stroke({ color: '#00BBFF', width: 3 }),
    })

    //Velg ikon basert på antall plasser i tilfluktsrom
    const getIconSrc = (plasser) => {
      if (plasser === 0)
        return '/ArbeidskravBase/icons/EmergencyShelterGrey.png'
      if (plasser >= 1 && plasser <= 200)
        return '/ArbeidskravBase/icons/EmergencyShelter.png'
      if (plasser >= 201 && plasser <= 500)
        return '/ArbeidskravBase/icons/EmergencyShelterYellow.png'
      if (plasser > 500)
        return '/ArbeidskravBase/icons/EmergencyShelterGreen.png'
      return '/ArbeidskravBase/icons/EmergencyShelter.png'
    }

    //Hover-stil for tilfluktsrom
    const getPointStyle = (plasser, isHovered = false) =>
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: getIconSrc(plasser),
            scale: isHovered ? 0.25 : 0.15,
          }),
        })

    //Henter oversikt over sivilforsvarsdistrikter
    const SivilforsvarsdistrikterSource = new VectorSource({
      url: '/ArbeidskravBase/geojson/Sivilforsvarsdistrikter.json',
      format: new GeoJSON(),
    })

    //Henter oversikt over offentlige tilfluktsrom
    const OffentligeTilfluktsromSource = new VectorSource({
      url: '/ArbeidskravBase/geojson/OffentligeTilfluktsrom.json',
      format: new GeoJSON(),
    })

    const SivilforsvarsdistrikterLayer = new VectorLayer({
      source: SivilforsvarsdistrikterSource,
      style: defaultPolygonStyle,
    })

    const OffentligeTilfluktsromLayer = new VectorLayer({
      source: OffentligeTilfluktsromSource,
      style: (feature) => {
        const plasser = feature.get('plasser') || 0
        return getPointStyle(plasser)
      },
    })

    //Popup med informasjon
    const popupOverlay = new Overlay({
      element: popupRef.current!,
      positioning: 'bottom-center',
      stopEvent: false,
    })

    //Oppretter kartet
    const map = new Map({
      target: mapRef.current!,
      view: new View({ center: [10.8, 59.9], zoom: 6 }),
      layers: [
        new TileLayer({ source: new OSM() }),
        SivilforsvarsdistrikterLayer,
        OffentligeTilfluktsromLayer,
      ],
      overlays: [popupOverlay],
    })

    //Endrer stil på hover
    map.on('pointermove', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat)
      SivilforsvarsdistrikterLayer.getSource()
          ?.getFeatures()
          .forEach((feat) => {
            feat.setStyle(
                feat === feature ? hoverPolygonStyle : defaultPolygonStyle
            )
          })
      OffentligeTilfluktsromLayer.getSource()
          ?.getFeatures()
          .forEach((feat) => {
            const plasser = feat.get('plasser') || 0
            feat.setStyle(getPointStyle(plasser, feat === feature))
          })
    })

    //Viser popup med klikk
    map.on('singleclick', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat)
      if (feature && feature.get('romnr')) {
        const properties = feature.getProperties()
        setPopupContent(
            `Adresse: ${properties.adresse}<br>Plasser: ${properties.plasser}`
        )
        popupOverlay.setPosition(event.coordinate)
      } else {
        setPopupContent(null)
        popupOverlay.setPosition(undefined)
      }
    })

    return () => map.setTarget(undefined)
  }, [])

  //Stil på pop up beskjed
  return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div
            ref={popupRef}
            className="popup"
            style={{
              position: 'absolute',
              background: 'white',
              padding: '5px',
              borderRadius: '5px',
              boxShadow: '0px 0px 5px rgba(0,0,0,0.3)',
              display: popupContent ? 'block' : 'none',
            }}
            dangerouslySetInnerHTML={{ __html: popupContent || '' }}
        />
      </div>
  )
}