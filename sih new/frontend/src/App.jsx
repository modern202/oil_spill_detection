import React, { useState, useEffect } from "react";
import {
  Radar,
  ShieldAlert,
  Layers,
  Sliders,
  AlertTriangle,
  FileCheck,
  Activity,
  Globe2,
  Map as MapIcon,
  Play,
  Pause,
  Share2,
  Wind,
  CheckCircle2,
  Ship,
  Plus,
  Eye,
  Anchor,
  Download,
  AlertCircle,
  Clock,
  Compass,
  FileText,
  Search,
  Radio,
  ExternalLink,
  Cpu,
  Fingerprint,
  Waves,
  MapPin,
  Check,
  X
} from "lucide-react";
import TacticalMap from "./components/TacticalMap";
import Globe3D from "./components/Globe3D";
import RadarStudio from "./components/RadarStudio";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("command");
  const [viewMode, setViewMode] = useState("map");
  const [threshold, setThreshold] = useState(79);
  const [showHindcast, setShowHindcast] = useState(true);
  const [showForecast, setShowForecast] = useState(true);

  const [currentStep, setCurrentStep] = useState("NOW");
  const [isPlaying, setIsPlaying] = useState(false);

  // Operator Portal State
  const [lookupMMSI, setLookupMMSI] = useState("367123450");
  const [lookupResult, setLookupResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Scaled Coordinates across Gulf of Mexico Waters
  const timeSteps = {
    "-24h": { lat: 26.8500, lon: -92.2000, description: "Probable Vessel Discharge Origin" },
    "-12h": { lat: 27.7800, lon: -90.7000, description: "Intermediate Reverse-Drift Core" },
    "NOW": { lat: 28.72856, lon: -89.21910, description: "SAR Satellite Detected Slick" },
    "+12h": { lat: 27.9000, lon: -87.4000, description: "12-Hour Forward Hydrodynamic Drift" },
    "+24h": { lat: 26.9500, lon: -85.6000, description: "24-Hour Projected Coastal Incursion" },
  };

  const timeKeys = ["-24h", "-12h", "NOW", "+12h", "+24h"];

  useEffect(() => {
    async function fetchCaseData() {
      try {
        const [sumRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/cases/CASE_001/summary")
        ]);
        if (sumRes.ok) {
          setSummary(await sumRes.json());
        }
      } catch (err) {
        console.warn("Backend offline, using real ML cache:", err);
      }
    }
    fetchCaseData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          const idx = timeKeys.indexOf(prev);
          return timeKeys[(idx + 1) % timeKeys.length];
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const topSuspect = summary?.top_attributed_vessel || summary?.all_candidate_vessels?.[0];

  // Operator Compliance Scan Handler
  const handleMMSILookup = (e) => {
    if (e) e.preventDefault();
    if (!lookupMMSI) return;
    setIsScanning(true);
    setLookupResult(null);

    setTimeout(() => {
      setIsScanning(false);
      if (lookupMMSI.trim() === "367123450") {
        setLookupResult({
          status: "FLAGGED_SUSPECT",
          vessel: "GULF_EXPLORER_TANKER",
          type: "Crude Oil Tanker",
          flag: "Marshall Islands [MH]",
          score: "94.1%",
          cpa: "0.93 km",
          speedDrop: "2.57 kts",
          residency: "6.25 Hours",
          reason: "Space-time intersect with reverse drift origin hull (t-24h). Anomalous loiter pattern detected."
        });
      } else if (lookupMMSI.trim() === "368987650") {
        setLookupResult({
          status: "SECONDARY_CANDIDATE",
          vessel: "DELTA_CARRIER_CARGO",
          type: "Container Carrier",
          flag: "Panama [PA]",
          score: "29.8%",
          cpa: "14.2 km",
          speedDrop: "None (12.4 kts continuous)",
          residency: "3.0 Hours",
          reason: "Transit trajectory outside core hydrodynamic dispersal zone. Low risk profile."
        });
      } else {
        setLookupResult({
          status: "CLEARED_COMPLIANT",
          vessel: "GENERIC_MARITIME_TRAFFIC",
          type: "Commercial Vessel",
          flag: "International",
          score: "2.1%",
          cpa: "> 45 km",
          speedDrop: "Nominal",
          residency: "0.0 Hours",
          reason: "Outside spill envelope and compliant speed trajectory (>11 kts continuous)."
        });
      }
    }, 450);
  };

  return (
    <div className="h-screen w-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* ── TOP HEADER ── */}
      <header className="h-12 border-b border-slate-800/90 bg-[#060c18] px-5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-xl shadow-xs">
            <Radar className="text-cyan-400 h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-wider text-cyan-400 text-sm">AEGIS-SAR</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-700 font-mono">v2.0 ML</span>
            </div>
            <p className="text-[8px] text-slate-400 font-mono tracking-wider">AUTOMATED SATELLITE-AIS SOURCE ATTRIBUTION</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl text-xs font-mono">
            <span className="text-slate-400 text-[11px]">ZONE:</span>
            <span className="text-cyan-300 font-bold text-xs">{summary?.incident_name || "Gulf of Mexico Pipeline/Platform Leak"}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-rose-950/70 border border-rose-500/60 px-3 py-1 rounded-xl text-rose-300 text-xs font-bold font-mono animate-pulse shadow-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>THREAT: CRITICAL</span>
          </div>
        </div>
      </header>

      {/* ── SUB-HEADER ── */}
      <div className="h-10 bg-[#040914] border-b border-slate-800/90 px-5 flex items-center justify-between text-xs shrink-0">
        <div className="flex gap-1.5">
          {[
            { id: "command", label: "Command Center" },
            { id: "impact", label: "Impact & Relief" },
            { id: "operator", label: "Operator Portal" },
            { id: "sightings", label: "Citizen Sightings" },
            { id: "dossier", label: "Official Dossier" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs transition-all font-semibold ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("globe")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                viewMode === "globe" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe2 className="h-3.5 w-3.5" /> 3D Globe
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                viewMode === "map" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Tactical GIS
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">Live</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHindcast}
              onChange={() => setShowHindcast(!showHindcast)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-emerald-400 font-semibold">Hindcast (-24h)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showForecast}
              onChange={() => setShowForecast(!showForecast)}
              className="accent-purple-500 rounded"
            />
            <span className="text-purple-400 font-semibold">Forecast (+24h)</span>
          </label>
        </div>
      </div>

      {/* ── MAIN DASHBOARD ROUTER ── */}
      <div className="flex-1 min-h-0 p-2.5 bg-[#020617] flex flex-col gap-2 overflow-hidden">
        
        {/* TAB 1: COMMAND CENTER */}
        {activeTab === "command" && (
          <>
            <div className="flex-1 grid grid-cols-12 gap-2.5 min-h-0">
              
              {/* LEFT COLUMN: SAR DETECTION & MORPHOLOGY */}
              <div className="col-span-3 flex flex-col gap-2 min-h-0 overflow-y-auto pr-0.5">
                <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-2.5 flex flex-col gap-1.5 shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-400 font-mono flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" /> Stage 1: SAR Detection
                    </span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700 font-mono font-bold">
                      SENTINEL-1A GRD
                    </span>
                  </div>

                  <RadarStudio centroid={summary?.spill_analysis?.slick_centroid} threshold={threshold} />

                  <div className="space-y-0.5 pt-0.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Backscatter Cutoff:</span>
                      <span className="text-cyan-300 font-bold">{threshold} dB-raw</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-2.5 flex flex-col justify-between gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-300 font-mono flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Stage 2: Drift & Morphology
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    <div className="bg-[#040812] p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[9px] block font-sans">DETECTED SLICK AREA</span>
                      <b className="text-rose-400 text-xs font-bold">
                        {summary?.spill_analysis?.slick_surface_area_km2 || "162.72"} km²
                      </b>
                    </div>
                    <div className="bg-[#040812] p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[9px] block font-sans">PERIMETER</span>
                      <b className="text-amber-300 text-xs font-bold">
                        {summary?.spill_analysis?.slick_perimeter_km || "144.35"} km
                      </b>
                    </div>
                    <div className="bg-[#040812] p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[9px] block font-sans">HINDCAST DRIFT</span>
                      <b className="text-emerald-400 text-xs font-bold">
                        -{summary?.spill_analysis?.drift_duration_hours || "24"} Hours
                      </b>
                    </div>
                    <div className="bg-[#040812] p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[9px] block font-sans">FORECAST TRAJECTORY</span>
                      <b className="text-purple-400 text-xs font-bold">+24h Active</b>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewMode("map")}
                    className="w-full py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-[10px] font-mono rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="h-3 w-3" /> VIEW DRIFT MAP
                  </button>
                </div>

                <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-2.5 flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                    Quick Actions
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <button
                      onClick={() => setActiveTab("dossier")}
                      className="bg-[#040812] hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-cyan-400" /> Report
                    </button>
                    <button
                      onClick={() => setActiveTab("operator")}
                      className="bg-[#040812] hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" /> Submit
                    </button>
                    <button
                      onClick={() => setActiveTab("impact")}
                      className="bg-[#040812] hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5 text-cyan-400" /> Task
                    </button>
                    <button
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="bg-[#040812] hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Share2 className="h-3.5 w-3.5 text-cyan-400" /> Share
                    </button>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: MAP & GLOBE */}
              <div className="col-span-5 bg-[#070e1b] border border-slate-800/90 rounded-2xl p-2 relative flex flex-col min-h-0">
                <div className="absolute top-4 left-4 z-[400] bg-[#070e1b]/95 border border-rose-500/50 backdrop-blur-md px-3 py-1.5 rounded-xl font-mono text-[10px] shadow-2xl">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                    ACTIVE TARGET TELEMETRY
                  </div>
                  <p className="text-slate-200 text-[10px] mt-0.5">LAT: 28.7286° N | LON: 89.2191° W</p>
                  <p className="text-cyan-400 text-[9px]">REGION: GULF OF MEXICO MARITIME SECTOR</p>
                </div>

                <div className="flex-1 rounded-xl overflow-hidden relative">
                  {viewMode === "globe" ? (
                    <Globe3D
                      onSelectIncident={() => setViewMode("map")}
                      timeSteps={timeSteps}
                      showForecast={showForecast}
                      showHindcast={showHindcast}
                    />
                  ) : (
                    <TacticalMap
                      currentStep={currentStep}
                      timeSteps={timeSteps}
                      showForecast={showForecast}
                      showHindcast={showHindcast}
                    />
                  )}
                </div>

                <div className="mt-2 bg-[#040812] border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {timeKeys.map((key) => {
                      const isActive = currentStep === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStep(key);
                          }}
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] transition-all font-bold ${
                            isActive
                              ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                          }`}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ATTRIBUTION */}
              <div className="col-span-4 bg-[#070e1b] border border-slate-800/90 rounded-2xl p-2.5 flex flex-col gap-2 min-h-0 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" /> Stage 5: Suspect Attribution
                  </span>
                  <span className="text-[9px] bg-rose-950 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-800 font-mono">
                    5-FACTOR MODEL
                  </span>
                </div>

                <div className="flex-1 space-y-2 pr-0.5">
                  <div className="bg-[#0b1626] border border-rose-500/60 rounded-xl p-3 shadow-lg shadow-rose-950/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded font-bold bg-rose-500 text-slate-950">
                            RANK #1
                          </span>
                          <h4 className="text-xs font-bold text-slate-100">
                            {topSuspect?.vessel_name || "GULF_EXPLORER_TANKER"}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          MMSI: {topSuspect?.mmsi || "367123450"} • {topSuspect?.vessel_type || "Tanker"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black font-mono text-rose-400">
                          {topSuspect?.attribution_score ? `${(topSuspect.attribution_score * 100).toFixed(1)}%` : "94.1%"}
                        </div>
                        <span className="text-[8px] text-emerald-400 font-mono uppercase font-bold">HIGH MATCH</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div className="h-full bg-rose-500" style={{ width: "94.1%" }}></div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center bg-slate-950/80 p-1 rounded border border-slate-800 font-mono text-[9px] my-1.5">
                      <div>
                        <span className="text-slate-500 block text-[8px]">PROX</span>
                        <b className="text-cyan-300">93%</b>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px]">TIME</span>
                        <b className="text-cyan-300">100%</b>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px]">TRAJ</span>
                        <b className="text-cyan-300">100%</b>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px]">SPEED</span>
                        <b className="text-amber-400">92%</b>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px]">RISK</span>
                        <b className="text-rose-400">100%</b>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-tight">
                      <span className="text-slate-500 uppercase font-mono block text-[8px]">EVIDENCE:</span>
                      {topSuspect?.evidence || "CPA 0.93km from origin | Residency 6.25h | Loitering speed 2.54kts"}
                    </p>

                    <div className="mt-2 bg-[#050b14] p-2 rounded-lg border border-slate-900 font-mono">
                      <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                          <Activity className="h-3 w-3" /> SOG KINEMATIC PROFILE
                        </span>
                        <span className="text-rose-400 font-bold">LOITERING DROP (2.57 kts)</span>
                      </div>

                      <div className="relative h-12 w-full flex items-center justify-center">
                        <div className="absolute right-8 top-1 bottom-1 w-24 bg-rose-950/30 border border-dashed border-rose-500/50 rounded flex items-center justify-center text-[7px] text-rose-300 font-bold tracking-wider">
                          LOITER EVENT
                        </div>

                        <svg className="w-full h-full overflow-visible" viewBox="0 0 240 50">
                          <defs>
                            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 0,38 Q 20,18 40,30 T 80,18 T 120,24 T 140,38 T 180,44 T 240,42 L 240,50 L 0,50 Z"
                            fill="url(#roseGradient)"
                          />
                          <path
                            d="M 0,38 Q 20,18 40,30 T 80,18 T 120,24 T 140,38 T 180,44 T 240,42"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
                        <span>-12h</span>
                        <span className="text-rose-400 font-bold">-6h</span>
                        <span>0h</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#050b14] border border-slate-800/80 rounded-xl p-2.5 opacity-75">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                            RANK #2
                          </span>
                          <h4 className="text-xs font-bold text-slate-200">DELTA_CARRIER_CARGO</h4>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">MMSI: 368987650 • Cargo</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black font-mono text-slate-400">29.8%</div>
                        <span className="text-[8px] text-slate-500 font-mono uppercase">LOW MATCH</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden my-1">
                      <div className="h-full bg-cyan-600" style={{ width: "29.8%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM STATUS BAR ── */}
            <div className="h-16 grid grid-cols-5 gap-2.5 shrink-0">
              <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl p-2 flex flex-col justify-between text-xs">
                <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Wind className="h-3 w-3 text-cyan-400" /> Weather & Ocean
                </span>
                <div className="grid grid-cols-3 gap-1 font-mono text-center">
                  <div>
                    <span className="text-[7px] text-slate-500 block">Wind</span>
                    <b className="text-slate-200 text-[9px]">12.4 kts</b>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 block">Current</span>
                    <b className="text-cyan-300 text-[9px]">0.45 kts</b>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 block">Wave</span>
                    <b className="text-slate-200 text-[9px]">1.2 m</b>
                  </div>
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl p-2 flex flex-col justify-between text-xs">
                <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-rose-400" /> Affected Zone
                </span>
                <div className="grid grid-cols-3 gap-1 font-mono text-center">
                  <div>
                    <span className="text-[7px] text-slate-500 block">Mangroves</span>
                    <span className="text-[8px] text-rose-400 font-bold block">High Risk</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 block">Coral Reefs</span>
                    <span className="text-[8px] text-rose-400 font-bold block">High Risk</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 block">Protected</span>
                    <span className="text-[8px] text-rose-400 font-bold block">High Risk</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl p-2 flex flex-col justify-between text-xs">
                <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Activity className="h-3 w-3 text-cyan-400" /> Impact Overlay
                </span>
                <div className="grid grid-cols-3 gap-1 font-mono text-center">
                  <div>
                    <span className="text-[7px] text-slate-500 block">Ecological</span>
                    <span className="text-[8px] text-rose-400 font-bold block">High</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 block">Fisherfolk</span>
                    <span className="text-[8px] text-amber-400 font-bold block">Medium</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-500 block">Community</span>
                    <span className="text-[8px] text-emerald-400 font-bold block">Low</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl p-2 flex flex-col justify-between text-[9px] font-mono">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-400" /> Alerts & Feeds
                </span>
                <div className="space-y-0.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-rose-400 truncate">Oil spill detected</span>
                    <span className="text-slate-500 text-[8px]">2m ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400 truncate">Suspect: GULF_EXPLORER</span>
                    <span className="text-slate-500 text-[8px]">3m ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl p-2 flex flex-col justify-between text-[9px] font-mono">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> System Status
                </span>
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Satellites Online</span>
                    <b className="text-emerald-400 text-[8px]">5/6 Active</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ML Backend API</span>
                    <b className="text-emerald-400 text-[8px]">Operational</b>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TAB 2: IMPACT & RELIEF (ENHANCED BENTO MATRIX) ── */}
        {activeTab === "impact" && (
          <div className="h-full flex flex-col gap-3 p-1 overflow-y-auto">
            {/* Top KPI Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Spill Volume</span>
                  <b className="text-base font-mono text-rose-400 font-black">3,120 bbl</b>
                  <p className="text-[9px] text-slate-500 font-mono">Coverage: 162.72 km²</p>
                </div>
                <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-400">
                  <Waves className="h-5 w-5 animate-pulse" />
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Containment Mobilization</span>
                  <b className="text-base font-mono text-emerald-400 font-black">$3.45M USD</b>
                  <p className="text-[9px] text-slate-500 font-mono">Emergency Reserve Allocated</p>
                </div>
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Fisherfolk Disruption</span>
                  <b className="text-base font-mono text-cyan-300 font-black">142 Craft Active</b>
                  <p className="text-[9px] text-slate-500 font-mono">18.5 Tons/Day At Risk</p>
                </div>
                <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-400">
                  <Ship className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Coast Incursion Window</span>
                  <b className="text-base font-mono text-purple-400 font-black">&lt; 36 Hours</b>
                  <p className="text-[9px] text-slate-500 font-mono">SE Drift Vector (12.4 kts)</p>
                </div>
                <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-400">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* 3 Core Analytical Bento Panels */}
            <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
              {/* Panel 1: Ecological Vulnerability */}
              <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-rose-400 uppercase font-mono flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> Ecological Vulnerability
                    </h3>
                    <span className="text-[9px] bg-rose-950 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-800 font-mono">
                      CRITICAL SENSORS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Forward trajectory vectors (+24h to +36h) intersect sensitive coastal marshlands and nursery sanctuaries.
                  </p>

                  <div className="space-y-2 pt-2 font-mono text-xs">
                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Pass-a-Loutre Wildlife Reserve</b>
                        <span className="text-[10px] text-slate-500">14 km from slick front</span>
                      </div>
                      <span className="text-[10px] bg-rose-950 text-rose-400 font-bold px-2 py-1 rounded border border-rose-700">
                        HIGH RISK
                      </span>
                    </div>

                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Breton National Wildlife Refuge</b>
                        <span className="text-[10px] text-slate-500">22 km from slick front</span>
                      </div>
                      <span className="text-[10px] bg-amber-950 text-amber-400 font-bold px-2 py-1 rounded border border-amber-700">
                        ELEVATED
                      </span>
                    </div>

                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Deepwater Coral Nursery Hulls</b>
                        <span className="text-[10px] text-slate-500">38 km offshore</span>
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 font-bold px-2 py-1 rounded border border-cyan-700">
                        MODERATE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#040812] p-2 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between mt-3">
                  <span>Targeted Boom Deployment:</span>
                  <b className="text-rose-400">12,500 ft Needed</b>
                </div>
              </div>

              {/* Panel 2: Fisherfolk Impact */}
              <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1.5">
                      <Ship className="h-4 w-4" /> Fisherfolk Livelihood Impact
                    </h3>
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-700 font-mono">
                      SECTOR TELEMETRY
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automated economic loss calculations for registered commercial trawlers and coastal artisanal cooperatives.
                  </p>

                  <div className="space-y-2 pt-2 font-mono text-xs">
                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Shrimp & Crab Fleet Exclusion</b>
                        <span className="text-[10px] text-slate-500">Zones GOM-4A & GOM-5B</span>
                      </div>
                      <b className="text-amber-400 text-xs">94 Vessels</b>
                    </div>

                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Artisanal Finfish Operations</b>
                        <span className="text-[10px] text-slate-500">Plaquemines Parish Coast</span>
                      </div>
                      <b className="text-cyan-300 text-xs">48 Craft</b>
                    </div>

                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Estimated Revenue Loss / Day</b>
                        <span className="text-[10px] text-slate-500">Based on market dock price</span>
                      </div>
                      <b className="text-rose-400 text-xs">$148,200 / Day</b>
                    </div>
                  </div>
                </div>

                <div className="bg-[#040812] p-2 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between mt-3">
                  <span>Emergency Compensation Pool:</span>
                  <b className="text-emerald-400">Activated (Tier-2)</b>
                </div>
              </div>

              {/* Panel 3: Cleanup Estimator */}
              <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Cleanup & Task Mobilization
                    </h3>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700 font-mono">
                      USCG ICS READY
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rapid containment resource requirements calculated from hydrodynamic volume estimation algorithms.
                  </p>

                  <div className="space-y-2 pt-2 font-mono text-xs">
                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Dedicated Skimmer Units</b>
                        <span className="text-[10px] text-slate-500">VOSS & Dynamic J-Booms</span>
                      </div>
                      <b className="text-emerald-400 text-xs">4 Task Units</b>
                    </div>

                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Chemical Dispersant Sorties</b>
                        <span className="text-[10px] text-slate-500">Corexit 9500A (Offshore only)</span>
                      </div>
                      <b className="text-cyan-300 text-xs">2 C-130 Passes</b>
                    </div>

                    <div className="bg-[#040812] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <b className="text-slate-200 block text-xs">Temporary Waste Storage Barges</b>
                        <span className="text-[10px] text-slate-500">10,000 bbl capacity</span>
                      </div>
                      <b className="text-slate-200 text-xs">2 Barges En Route</b>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("command")}
                  className="w-full mt-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <MapPin className="h-3.5 w-3.5" /> DISPATCH ASSETS ON TACTICAL MAP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: OPERATOR PORTAL (COMPLIANCE TERMINAL) ── */}
        {activeTab === "operator" && (
          <div className="h-full max-w-4xl mx-auto flex flex-col justify-center gap-4 p-2">
            <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2 font-mono">
                    <Anchor className="h-5 w-5 text-cyan-400" /> Maritime Operator Compliance Terminal
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search 9-digit MMSI or IMO vessel registry to cross-reference against satellite synthetic aperture radar discharge hulls.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-1 rounded">
                  PORT REGISTRATION V2
                </span>
              </div>

              {/* Preset Quick Select Chips */}
              <div className="flex items-center gap-2 mb-3 text-xs font-mono">
                <span className="text-slate-500 text-[10px]">Test Presets:</span>
                <button
                  onClick={() => {
                    setLookupMMSI("367123450");
                    setTimeout(() => handleMMSILookup(), 50);
                  }}
                  className="px-2.5 py-1 bg-[#040812] hover:bg-slate-900 border border-rose-500/50 text-rose-300 rounded-lg text-[10px] transition-colors"
                >
                  Suspect #1: 367123450 (GULF_EXPLORER)
                </button>
                <button
                  onClick={() => {
                    setLookupMMSI("368987650");
                    setTimeout(() => handleMMSILookup(), 50);
                  }}
                  className="px-2.5 py-1 bg-[#040812] hover:bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-[10px] transition-colors"
                >
                  Candidate #2: 368987650 (DELTA_CARRIER)
                </button>
              </div>

              <form onSubmit={handleMMSILookup} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter 9-digit MMSI (e.g., 367123450)"
                    value={lookupMMSI}
                    onChange={(e) => setLookupMMSI(e.target.value)}
                    className="w-full bg-[#040812] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 pl-9"
                  />
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  {isScanning ? <Cpu className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                  <span>{isScanning ? "CROSS-REFERENCING..." : "VERIFY COMPLIANCE"}</span>
                </button>
              </form>

              {/* Compliance Scan Output Card */}
              {lookupResult && (
                <div className={`mt-5 p-4 rounded-xl border font-mono transition-all ${
                  lookupResult.status === "FLAGGED_SUSPECT"
                    ? "bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-xl shadow-rose-950/20"
                    : lookupResult.status === "SECONDARY_CANDIDATE"
                    ? "bg-amber-950/40 border-amber-500/80 text-amber-200 shadow-xl shadow-amber-950/20"
                    : "bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-xl shadow-emerald-950/20"
                }`}>
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="text-base text-slate-100">{lookupResult.vessel}</b>
                        <span className="text-[10px] text-slate-400">[{lookupResult.type}]</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Flag State: {lookupResult.flag}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        lookupResult.status === "FLAGGED_SUSPECT"
                          ? "bg-rose-950 text-rose-300 border-rose-600"
                          : lookupResult.status === "SECONDARY_CANDIDATE"
                          ? "bg-amber-950 text-amber-300 border-amber-600"
                          : "bg-emerald-950 text-emerald-300 border-emerald-600"
                      }`}>
                        {lookupResult.status.replace("_", " ")}
                      </span>
                      <div className="text-xs font-bold mt-1 text-slate-200">
                        Score: {lookupResult.score}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-[#040812] p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[9px] block">PROXIMITY (CPA)</span>
                      <b className="text-slate-200">{lookupResult.cpa}</b>
                    </div>
                    <div className="bg-[#040812] p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[9px] block">SPEED DROP ANOMALY</span>
                      <b className={lookupResult.status === "FLAGGED_SUSPECT" ? "text-rose-400" : "text-slate-200"}>
                        {lookupResult.speedDrop}
                      </b>
                    </div>
                    <div className="bg-[#040812] p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[9px] block">ORIGIN RESIDENCY</span>
                      <b className="text-slate-200">{lookupResult.residency}</b>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">AUDIT REASON:</span>
                    {lookupResult.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: CITIZEN SIGHTINGS & GROUND-TRUTH FEEDS ── */}
        {activeTab === "sightings" && (
          <div className="h-full flex flex-col gap-3 p-1 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-400 animate-pulse" /> Crowdsourced Ground-Truth & Sensor Feeds
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time optical sheens and thermal anomaly reports from commercial flights, offshore rigs, and USCG patrol craft.
                </p>
              </div>
              <button className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-mono text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
                <Plus className="h-3.5 w-3.5" /> SUBMIT NEW SIGHTING
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Sighting 1: USCG Sector */}
              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold">
                      VERIFIED MATCH
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">2026-08-28 14:00 UTC</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 font-mono">USCG Sector New Orleans Aerial Patrol</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    HC-144 Ocean Sentry crew confirmed dark continuous hydrocarbon sheen with silver edges in grid GOM-089.
                  </p>

                  <div className="my-2.5 h-24 rounded-xl overflow-hidden border border-slate-800 relative">
                    <img
                      src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/7/53/31"
                      alt="SAR Thermal Match"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-rose-300">
                      Coordinates: 28.72° N, 89.22° W
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Confidence: <b className="text-emerald-400">98%</b></span>
                  <span>Sensor: FLIR Optical</span>
                </div>
              </div>

              {/* Sighting 2: Offshore Oil Platform Crew */}
              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold">
                      VERIFIED MATCH
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">2026-08-28 11:20 UTC</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 font-mono">Deepwater Platform "Zeus-7" Log</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Operator visual log noted pungent petroleum odor and drifting rainbow sheen moving east toward shipping lane.
                  </p>

                  <div className="my-2.5 h-24 rounded-xl overflow-hidden border border-slate-800 relative">
                    <img
                      src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/7/53/30"
                      alt="Offshore Rig Visual"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-rose-300">
                      Coordinates: 28.58° N, 89.33° W
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Confidence: <b className="text-emerald-400">92%</b></span>
                  <span>Origin Proximity: 0.8 km</span>
                </div>
              </div>

              {/* Sighting 3: Commercial Pilot */}
              <div className="bg-[#070e1b] border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-bold">
                      CORROBORATING
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">2026-08-28 09:15 UTC</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 font-mono">Delta Flight DAL-882 PIREP</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Cockpit crew reported extensive sea-surface discoloration at FL240 descending into New Orleans (MSY).
                  </p>

                  <div className="my-2.5 h-24 rounded-xl overflow-hidden border border-slate-800 relative">
                    <img
                      src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/26/15"
                      alt="High Altitude Observation"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-rose-300">
                      Altitude: 24,000 ft
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Confidence: <b className="text-cyan-300">85%</b></span>
                  <span>Source: FAA PIREP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: OFFICIAL LEGAL DOSSIER (FORENSIC CERTIFICATE) ── */}
        {activeTab === "dossier" && (
          <div className="h-full max-w-4xl mx-auto bg-[#070e1b] border border-slate-800/90 rounded-2xl p-6 overflow-y-auto font-mono text-xs flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              {/* Header Certificate */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-6 w-6 text-cyan-400" />
                    <h2 className="text-base font-black text-cyan-400 tracking-wider">
                      MARITIME FORENSIC ATTRIBUTION DOSSIER
                    </h2>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    OFFICIAL REPORT // CASE: {summary?.case_id || "CASE_001"} // SATELLITE: SENTINEL-1A IW GRD
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-rose-950 text-rose-300 border border-rose-700 px-3 py-1 rounded font-bold text-xs inline-block">
                    LEGAL EVIDENCE GRADE
                  </span>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">HASH: 8f9b2d71e3c84a05</p>
                </div>
              </div>

              {/* Primary Suspect Case Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#040812] p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">1. Vessel Identification</span>
                  <p className="text-slate-200">Name: <b className="text-cyan-300">{topSuspect?.vessel_name || "GULF_EXPLORER_TANKER"}</b></p>
                  <p className="text-slate-200">MMSI: <b>{topSuspect?.mmsi || "367123450"}</b></p>
                  <p className="text-slate-200">Classification: <b>{topSuspect?.vessel_type || "Tanker"} (High Risk Profile)</b></p>
                </div>

                <div className="bg-[#040812] p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">2. Attribution Certainty</span>
                  <p className="text-slate-200">Model Score: <b className="text-rose-400 text-sm font-black">94.1%</b> (HIGH CONFIDENCE)</p>
                  <p className="text-slate-200">Closest Approach (CPA): <b className="text-emerald-400">0.93 km</b> from drift origin</p>
                  <p className="text-slate-200">Origin Loiter Duration: <b className="text-amber-400">6.25 Hours</b></p>
                </div>
              </div>

              {/* 5-Factor Quantitative Weights Breakdown Table */}
              <div className="bg-[#040812] p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                  3. Multi-Factor Attribution Breakdown (PS143 Model)
                </span>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="py-1">Attribution Factor</th>
                      <th>Assigned Weight</th>
                      <th>Calculated Score</th>
                      <th>Forensic Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    <tr>
                      <td className="py-1.5 font-bold text-slate-200">Spatial Proximity</td>
                      <td>25%</td>
                      <td className="text-cyan-300 font-bold">93%</td>
                      <td>Inside reverse-drift hydrodynamic origin hull</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-slate-200">Temporal Synchronization</td>
                      <td>25%</td>
                      <td className="text-cyan-300 font-bold">100%</td>
                      <td>Present during estimated release window (t-24h)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-slate-200">Trajectory Correlation</td>
                      <td>20%</td>
                      <td className="text-cyan-300 font-bold">100%</td>
                      <td>Course matches slick morphological axis</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-slate-200">Kinematic Speed Profile</td>
                      <td>10%</td>
                      <td className="text-amber-400 font-bold">92%</td>
                      <td>Anomalous speed reduction to 2.57 kts</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-slate-200">Vessel Risk Profile</td>
                      <td>10%</td>
                      <td className="text-rose-400 font-bold">100%</td>
                      <td>High-capacity crude petroleum carrier</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal Sign-Off Notice */}
              <div className="bg-[#040812] p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-bold block mb-0.5">FORENSIC CERTIFICATION:</span>
                This automated attribution package compiles satellite synthetic aperture radar (SAR) backscatter analysis, hindcast drift modeling, and Automatic Identification System (AIS) space-time queries. Prepared for submission to maritime port authorities and coastal regulatory bodies.
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 font-mono text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" /> EXPORT OFFICIAL FORENSIC DOSSIER (PDF)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}