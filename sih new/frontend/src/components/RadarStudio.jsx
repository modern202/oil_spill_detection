import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { AlertTriangle } from "lucide-react";
import "leaflet/dist/leaflet.css";

function MiniMapController() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function RadarStudio({ centroid, threshold }) {
  const targetLat = centroid?.lat || 28.72856;
  const targetLon = centroid?.lon || -89.2191;

  return (
    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-800 bg-[#040812] shadow-inner select-none">
      
      {/* Real Ocean Satellite Imagery */}
      <MapContainer
        center={[26.8, -89.0]}
        zoom={4}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        attributionControl={false}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        <MiniMapController />

        {/* Dynamic Thermal / SAR Backscatter Hazard Dispersion Aura */}
        <CircleMarker
          center={[targetLat, targetLon]}
          radius={40 * (threshold / 79)}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#e11d48",
            fillOpacity: 0.3,
            weight: 1,
          }}
        />

        <CircleMarker
          center={[targetLat, targetLon]}
          radius={22 * (threshold / 79)}
          pathOptions={{
            color: "#fb7185",
            fillColor: "#f43f5e",
            fillOpacity: 0.6,
            weight: 1.5,
          }}
        />

        <CircleMarker
          center={[targetLat, targetLon]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#ef4444",
            fillOpacity: 0.95,
            weight: 2,
          }}
        />
      </MapContainer>

      {/* Cyber Grid & City Labels */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2 text-cyan-400/60 text-[9px] font-mono tracking-widest uppercase font-bold">
          Gulf of Mexico
        </div>

        <div className="absolute top-2 left-1/3 text-[8px] font-mono text-slate-200 bg-slate-950/70 px-1 rounded">
          New Orleans
        </div>
        <div className="absolute top-6 left-2 text-[8px] font-mono text-slate-200 bg-slate-950/70 px-1 rounded">
          Houston
        </div>
        <div className="absolute top-4 right-8 text-[8px] font-mono text-slate-200 bg-slate-950/70 px-1 rounded">
          Tampa
        </div>
        <div className="absolute bottom-6 right-6 text-[8px] font-mono text-slate-200 bg-slate-950/70 px-1 rounded">
          Havana
        </div>

        {/* Center Target Warning Icon Badge */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="relative p-1 bg-slate-950/90 border border-rose-500 rounded-md shadow-lg shadow-rose-950 animate-pulse">
            <AlertTriangle className="h-3 w-3 text-rose-400" />
          </div>
        </div>

        {/* Legend Badge */}
        <div className="absolute bottom-1.5 left-1.5 bg-[#070e1b]/95 border border-slate-800 p-1.5 rounded-lg text-[8px] font-mono space-y-0.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-1 text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Possible Oil Spill Detected</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <span className="h-0.5 w-2 bg-purple-400 border border-dashed"></span>
            <span>Predicted Drift (24h)</span>
          </div>
        </div>
      </div>

    </div>
  );
}