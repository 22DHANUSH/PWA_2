import React from "react";
import MapView from "../components/map/MapView";

const Map = () => {
  return (
    <div>
      <div style={{ marginTop: "3rem" }}>
        {/* <h1>Columbia Stores Near You</h1> */}
        <MapView />
      </div>
    </div>
  );
};

export default Map;
