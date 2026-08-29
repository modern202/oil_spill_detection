import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapSizeFixer({ center }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    if (center?.lat && center?.lon) {
      map.setView([center.lat, center.lon], 6);
    }
    return () => clearTimeout(t);
  }, [map, center]);
  return null;
}

export default function TacticalMap({ currentStep, timeSteps, showForecast, showHindcast }) {
  const currentCoord = timeSteps[currentStep] || timeSteps["NOW"];
  const centerLat = 26.5;
  const centerLon = -89.0;

  // Complete trajectory polyline coordinates
  const hindcastLine = [
    [timeSteps["-24h"].lat, timeSteps["-24h"].lon],
    [timeSteps["-12h"].lat, timeSteps["-12h"].lon],
    [timeSteps["NOW"].lat, timeSteps["NOW"].lon],
  ];

  const forecastLine = [
    [timeSteps["NOW"].lat, timeSteps["NOW"].lon],
    [timeSteps["+12h"].lat, timeSteps["+12h"].lon],
    [timeSteps["+24h"].lat, timeSteps["+24h"].lon],
  ];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 bg-[#020617] flex flex-col">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={6}
        scrollWheelZoom={true}
        attributionControl={false}
        className="w-full h-full flex-1 z-0"
        style={{ height: "100%", width: "100%" }}
      >
        {/* Esri Real Earth Satellite Ocean Surface */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        {/* Global Cities & Reference Labels */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          opacity={0.85}
        />

        <MapSizeFixer center={{ lat: centerLat, lon: centerLon }} />

        {/* ── 1. HINDCAST VECTOR & HISTORICAL RED NODES (-24h to NOW) ── */}
        {showHindcast && (
          <>
            <Polyline
              positions={hindcastLine}
              pathOptions={{ color: "#10b981", weight: 3.5, dashArray: "6,6", opacity: 0.9 }}
            />

            {/* -24h Discharge Origin Node (Red Hazard Node) */}
            <CircleMarker
              center={[timeSteps["-24h"].lat, timeSteps["-24h"].lon]}
              radius={10}
              pathOptions={{ color: "#ffffff", fillColor: "#ef4444", fillOpacity: 1.0, weight: 2.5 }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-900">
                  <b className="text-rose-600 block font-bold">DISCHARGE ORIGIN (-24h)</b>
                  <p className="text-slate-700">Lat: {timeSteps["-24h"].lat.toFixed(4)}, Lon: {timeSteps["-24h"].lon.toFixed(4)}</p>
                </div>
              </Popup>
            </CircleMarker>

            {/* -12h Drift Intermediate Node */}
            <CircleMarker
              center={[timeSteps["-12h"].lat, timeSteps["-12h"].lon]}
              radius={9}
              pathOptions={{ color: "#f59e0b", fillColor: "#ef4444", fillOpacity: 0.95, weight: 2 }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-900">
                  <b className="text-amber-600 block font-bold">DRIFT INTERMEDIATE (-12h)</b>
                  <p className="text-slate-700">Lat: {timeSteps["-12h"].lat.toFixed(4)}, Lon: {timeSteps["-12h"].lon.toFixed(4)}</p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* ── 2. FORWARD CAST VECTOR & PREDICTED RED IMPACT NODES (NOW to +24h) ── */}
        {showForecast && (
          <>
            <Polyline
              positions={forecastLine}
              pathOptions={{ color: "#c084fc", weight: 4, dashArray: "8,8", opacity: 0.95 }}
            />

            {/* +12h Projected Drift Node */}
            <CircleMarker
              center={[timeSteps["+12h"].lat, timeSteps["+12h"].lon]}
              radius={9}
              pathOptions={{ color: "#c084fc", fillColor: "#f43f5e", fillOpacity: 0.95, weight: 2 }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-900">
                  <b className="text-purple-600 block font-bold">PROJECTED DRIFT (+12h)</b>
                  <p className="text-slate-700">Lat: {timeSteps["+12h"].lat.toFixed(4)}, Lon: {timeSteps["+12h"].lon.toFixed(4)}</p>
                </div>
              </Popup>
            </CircleMarker>

            {/* +24h Coastal Incursion Impact Node */}
            <CircleMarker
              center={[timeSteps["+24h"].lat, timeSteps["+24h"].lon]}
              radius={10}
              pathOptions={{ color: "#ffffff", fillColor: "#ef4444", fillOpacity: 1.0, weight: 2.5 }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-900">
                  <b className="text-rose-600 block font-bold">COASTAL IMPACT (+24h)</b>
                  <p className="text-slate-700">Lat: {timeSteps["+24h"].lat.toFixed(4)}, Lon: {timeSteps["+24h"].lon.toFixed(4)}</p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* ── 3. ACTIVE SELECTED TIMESTEP (PULSING HIGH-DANGER RADAR AURA) ── */}
        <CircleMarker
          center={[currentCoord.lat, currentCoord.lon]}
          radius={30}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#e11d48",
            fillOpacity: 0.4,
            weight: 2,
            dashArray: "4,4",
          }}
        />

        <CircleMarker
          center={[currentCoord.lat, currentCoord.lon]}
          radius={15}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#ef4444",
            fillOpacity: 0.95,
            weight: 3,
          }}
        >
          <Popup>
            <div className="p-1 font-sans text-slate-900">
              <b className="text-xs text-rose-600 block font-bold">⚠️ ACTIVE SPILL SLICK [{currentStep}]</b>
              <p className="text-xs text-slate-700">Coordinates: <b>{currentCoord.lat.toFixed(4)}° N, {Math.abs(currentCoord.lon).toFixed(4)}° W</b></p>
              <p className="text-[11px] text-slate-600">Slick Area: <b>162.72 km²</b></p>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>

      {/* Real-Time Confidence Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-[#070e1b]/95 border border-slate-800 p-2.5 rounded-xl text-[10px] font-mono space-y-1 backdrop-blur-md shadow-2xl">
        <b className="text-xs text-slate-200 block font-bold">Oil Spill Confidence</b>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          <span className="text-slate-300">High (90-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          <span className="text-slate-400">Medium (60-90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-400">Low (30-60%)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="h-0.5 w-3 bg-purple-400 border border-dashed"></span>
          <span className="text-purple-300 font-mono text-[9px]">Predicted Drift (24h)</span>
        </div>
      </div>
    </div>
  );
}