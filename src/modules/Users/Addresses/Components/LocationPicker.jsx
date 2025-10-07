import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "../Addresses.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

export default function LocationPicker({ lat, lng, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

    const initializeMap = () => {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: 16,
      });

      mapRef.current.on("load", () => {
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markerRef.current.on("dragend", () => {
          const { lat, lng } = markerRef.current.getLngLat();
          onChange(lat, lng);
        });

        setTimeout(() => {
          mapRef.current?.resize();
        }, 300);
      });
    };

    if (!mapRef.current) {
      initializeMap();
    } else {
      mapRef.current.setCenter([lng, lat]);

      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markerRef.current.on("dragend", () => {
          const { lat, lng } = markerRef.current.getLngLat();
          onChange(lat, lng);
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng]);

  return <div ref={mapContainerRef} className="map-container" />;
}
