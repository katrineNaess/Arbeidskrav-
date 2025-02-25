import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";

import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Fill, Stroke, Style } from "ol/style";

useGeographic();

//const map = new Map({
//view: new View({ center: [10.8, 59.9], zoom: 13 }),
//layers: [new TileLayer({ source: new OSM() })],
//});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const Sivilforsvarsdistrikter = new VectorLayer({
      source: new VectorSource({
        url: "/geojson/Sivilforsvarsdistrikter.json",
        format: new GeoJSON(),
      }),
      style: new Style({
        fill: new Fill({ color: "rgba(0, 0, 255, 0.3)" }),
        stroke: new Stroke({ color: "#0000FF", width: 2 }),
      }),
    });

    const map = new Map({
      target: mapRef.current!,
      view: new View({ center: [10.8, 59.9], zoom: 6 }),
      layers: [
        new TileLayer({ source: new OSM() }), // Bakgrunnskart
        Sivilforsvarsdistrikter, // Polygonlag
      ],
    });

    map.setTarget(mapRef.current!);
  }, []);

  return <div ref={mapRef}></div>;
}
