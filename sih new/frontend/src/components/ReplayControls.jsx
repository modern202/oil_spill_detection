import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Clock, 
  AlertOctagon, 
  ShieldAlert, 
  Wind, 
  Navigation,
  Satellite
} from 'lucide-react';

export default function ReplayControls({
  currentTimelineHour,
  setTimelineHour,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  scenarioMeta,
  topSuspect
}) {
  // Timeline spans from -12.0 hours to +24.0 hours
  const minHour = -12.0;
  const maxHour = 24.0;

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineHour((prev) => {
          const next = prev + 0.25 * playbackSpeed;
          if (next >= maxHour) {
            setIsPlaying(false);
            return maxHour;
          }
          return Math.round(next * 100) / 100;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, maxHour, setIsPlaying, setTimelineHour]);

  const handleReset = () => {
    setIsPlaying(false);
    setTimelineHour(-12.0);
  };

  const getTimelineEventStatus = (hour) => {
    if (hour <= -7.0) {
      return {
        stage: 'PRE-INCIDENT TRANSIT',
        color: 'text-slate-400',
        badgeBg: 'bg-slate-900 border-slate-700',
        icon: <Navigation className="w-3.5 h-3.5 text-cyan-400" />,
        desc: 'Vessels maintaining routine transit speed along designated international shipping lane.'
      };
    } else if (hour > -7.0 && hour <= -5.0) {
      return {
        stage: 'ILLEGAL DISCHARGE EVENT (T-6H)',
        color: 'text-red-400 font-bold animate-pulse',
        badgeBg: 'bg-red-950/80 border-red-500/80 shadow-md shadow-red-950',
        icon: <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-bounce" />,
        desc: `SUSPECT SLOWDOWN: ${topSuspect?.vessel_name || 'Primary Suspect'} drops speed to 3.2 knots, makes S-turn & discharges oily waste.`
      };
    } else if (hour > -5.0 && hour < 0.0) {
      return {
        stage: 'HYDRODYNAMIC ADVECTION',
        color: 'text-amber-300 font-semibold',
        badgeBg: 'bg-amber-950/70 border-amber-500/60',
        icon: <Wind className="w-3.5 h-3.5 text-amber-400" />,
        desc: `Drift advection active: Ocean current (${scenarioMeta?.ocean_data?.current_u_ms || 0.28} m/s) and wind push slick toward observation point.`
      };
    } else if (Math.abs(hour) <= 0.5) {
      return {
        stage: 'SENTINEL-1 SAR PASS (T-0H)',
        color: 'text-cyan-300 font-bold',
        badgeBg: 'bg-cyan-950/80 border-cyan-400/80 shadow-md shadow-cyan-950',
        icon: <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
        desc: 'Copernicus Sentinel-1 SAR satellite pass snaps radar imagery and isolates dark slick polygon.'
      };
    } else {
      return {
        stage: 'FORWARD DRIFT FORECAST',
        color: 'text-emerald-300 font-semibold',
        badgeBg: 'bg-emerald-950/70 border-emerald-500/60',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />,
        desc: `Forecasting forward dispersion (T+${hour.toFixed(0)}h) for rapid containment response and shoreline protection.`
      };
    }
  };

  const status = getTimelineEventStatus(currentTimelineHour);

  return (
    <div className="tactical-glass p-3 rounded-lg border-cyan-800/40 space-y-2">
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-400 font-mono text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>4D REPLAY</span>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono flex items-center gap-1.5 ${status.badgeBg} ${status.color}`}>
            {status.icon}
            <span>{status.stage}</span>
          </div>
        </div>

        {/* Current Relative Time Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">REL. TIME:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${
            currentTimelineHour < 0 ? 'bg-amber-950/80 text-amber-300 border border-amber-600' :
            currentTimelineHour === 0 ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500' :
            'bg-emerald-950/80 text-emerald-300 border border-emerald-600'
          }`}>
            {currentTimelineHour < 0 ? `T - ${Math.abs(currentTimelineHour).toFixed(1)}h` :
             currentTimelineHour === 0 ? 'T ± 0.0h (Observation)' :
             `T + ${currentTimelineHour.toFixed(1)}h (Forecast)`}
          </span>
        </div>
      </div>

      {/* Description HUD */}
      <div className="px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 font-mono flex items-center justify-between">
        <span className="truncate">{status.desc}</span>
        <span className="text-cyan-400 text-[10px] hidden md:inline">STANDOUT DEMO</span>
      </div>

      {/* Scrubber Slider & Timeline Markers */}
      <div className="space-y-1 pt-1">
        <div className="relative">
          <input
            type="range"
            min={minHour}
            max={maxHour}
            step="0.25"
            value={currentTimelineHour}
            onChange={(e) => {
              setIsPlaying(false);
              setTimelineHour(Number(e.target.value));
            }}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          {/* Key milestone ticks */}
          <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
            <span>T-12h (Hindcast Start)</span>
            <span className="text-red-400 font-bold">T-6h (Origin Discharge)</span>
            <span className="text-cyan-400 font-bold">T-0h (SAR Pass)</span>
            <span className="text-emerald-400">T+12h</span>
            <span>T+24h (Forecast End)</span>
          </div>
        </div>
      </div>

      {/* Playback Controls & Speed Multipliers */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-900/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'RECONSTRUCT INCIDENT'}</span>
          </button>

          <button
            onClick={handleReset}
            title="Rewind to T-12h"
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-800 text-[10px] font-mono">
          <span className="text-slate-500 px-1">SPEED:</span>
          {[1, 2, 4, 8].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                playbackSpeed === spd
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
