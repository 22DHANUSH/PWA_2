import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { getDistance } from "geolib";
import "mapbox-gl/dist/mapbox-gl.css";
import "antd/dist/reset.css";
import axios from "axios";
import "./MapView.css";
import { useNavigate } from "react-router-dom";
import { fetchStores } from "../../insightsapi";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGFtemF6YWlkaSIsImEiOiJja3ZtY3RodzgwNGdlMzBwaWdjNWx5cTQ3In0.2s32bZnlSY-Qg5PFmoLrJw";

const MapView = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [rangeKm, setRangeKm] = useState(50);
  const [storeList, setStoreList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("✅ Got user location:", latitude, longitude);
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        alert("Unable to fetch location. Please check browser permissions.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
        essential: true,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStores();
        setStoreList(data);
      } catch (error) {
        console.error("❌ Failed to fetch Stores:", error);
        alert("Unable to load Stores. Please check API availability.");
      }
    };

    loadStores();
  }, []);

  const addStoreMarker = async (store, userLoc, map) => {
    try {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLoc.lng},${userLoc.lat};${store.storeLongitude},${store.storeLatitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await axios.get(directionsUrl);
      const route = response.data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(2);
      const durationMin = Math.ceil(route.duration / 60);

      const popupHTML = `
  <div style="font-family: sans-serif; max-width: 220px;">
    <strong>${store.storeName}</strong><br/>
    🏠 ${store.storeAddress}<br/>
    📍 Pincode : ${store.storePinCode}<br/>
    📞 <u>${store.phone}</u><br/>
    🚗 Driving Distance: ${distanceKm} km<br/>
    ⏱️ Estimated Time: ${durationMin} mins<br/>
    <a href="https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${store.latitude},${store.longitude}&travelmode=driving" target="_blank" style="color: #007bff; text-decoration: underline;">Navigate</a>
  </div>
`;

      const popup = new mapboxgl.Popup().setHTML(popupHTML);

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.backgroundImage = "url(/image.png)";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "cover";
      el.style.borderRadius = "50%";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([store.storeLongitude, store.storeLatitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    } catch (error) {
      console.error("Error in addStoreMarker:", error);
    }
  };

  useEffect(() => {
    if (!userLocation || !mapRef.current || storeList.length === 0) return;
    const map = mapRef.current;

    const updateMarkers = async () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const userMarker = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setText("Your Location"))
        .addTo(map);
      markersRef.current.push(userMarker);

      const nearby = storeList.filter((store) => {
        const d = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: store.storeLatitude, longitude: store.storeLongitude }
        );
        return d / 1000 <= rangeKm;
      });

      for (const store of nearby) {
        await addStoreMarker(store, userLocation, map);
      }
    };

    if (!map.isStyleLoaded()) {
      map.once("style.load", updateMarkers);
    } else {
      updateMarkers();
    }
  }, [userLocation, rangeKm, storeList]);

  return (
    <div className="map-wrapper">
      <div className="controls">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <label>Range (km):</label>
        <input
          type="range"
          min={1}
          max={50}
          value={rangeKm}
          onChange={(e) => setRangeKm(Number(e.target.value))}
        />
        <span>{rangeKm} km</span>
      </div>

      <div className="map-container" ref={mapContainer} />

      <div className="map-controls">
        <button onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button onClick={() => mapRef.current?.zoomOut()}>−</button>
        <button
          onClick={() => {
            if (userLocation && mapRef.current) {
              mapRef.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 14,
                essential: true,
              });
            }
          }}
        >
          📍
        </button>
      </div>
    </div>
  );
};

export default MapView;
