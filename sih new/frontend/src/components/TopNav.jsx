import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Satellite, 
  Compass, 
  FileText, 
  AlertTriangle, 
  Anchor, 
  Eye, 
  Layers, 
  Activity,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function TopNav({
  scenarios,
  currentScenarioId,
  onSelectScenario,
  threatLevel,
  onOpenDossier,
  onOpenImpact,
  onOpenCompliance,
  onOpenCitizenReports,
  activeTab,
  setActiveTab
}) {
  const [zuluTime, setZuluTime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC [Z]';
      setZuluTime(iso);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getThreatBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-400 text-xs font-mono font-semibold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> THREAT: CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-400 text-xs font-mono font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" /> THREAT: HIGH
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 text-xs font-mono font-semibold">
            <Activity className="w-3.5 h-3.5" /> THREAT: MONITORING
          </span>
        );
    }
  };

  return (
    <header className="tactical-glass border-b border-cyan-900/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand & System Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-900 border border-cyan-400/40 shadow-lg shadow-cyan-950/50">
          <Satellite className="w-5 h-5 text-cyan-100 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wider text-slate-100 font-mono">
              AEGIS-SAR <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">v2.0</span>
            </h1>
            <span className="text-xs text-slate-400 hidden sm:inline">| Maritime Forensic Intelligence</span>
          </div>
          <p className="text-[11px] text-cyan-300/80 font-mono flex items-center gap-1.5">
            <span>DEFENSE / ICG ATTRIBUTION ENGINE</span>
          </p>
        </div>
      </div>

      {/* Center Operational Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 rounded-lg px-2.5 py-1">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400 font-mono hidden md:inline">INCIDENT ZONE:</span>
          <select
            value={currentScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-xs font-semibold text-cyan-300 focus:outline-none cursor-pointer"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                {sc.name} ({sc.region})
              </option>
            ))}
          </select>
        </div>

        {/* Threat Level */}
        {getThreatBadge(threatLevel)}

        {/* Zulu Time HUD */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-950/90 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{zuluTime}</span>
        </div>
      </div>

      {/* Right Navigation & Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('command')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'command'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={onOpenImpact}
            className="px-3 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Impact & Relief</span>
          </button>
          <button
            onClick={onOpenCompliance}
            className="px-3 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            <Anchor className="w-3.5 h-3.5 text-blue-400" />
            <span>Operator Portal</span>
          </button>
          <button
            onClick={onOpenCitizenReports}
            className="px-3 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Sightings</span>
          </button>
        </div>

        {/* Generate Evidence Dossier Button */}
        <button
          onClick={onOpenDossier}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-900/30 border border-cyan-400/40 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Official Dossier</span>
        </button>
      </div>
    </header>
  );
}
