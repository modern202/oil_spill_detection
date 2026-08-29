import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  AlertTriangle, 
  Anchor, 
  Compass, 
  Clock, 
  Activity, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  FileSearch,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function SuspectLeaderboard({
  leaderboard,
  selectedVessel,
  onSelectVessel
}) {
  const [expandedMmsi, setExpandedMmsi] = useState(null);

  const toggleExpand = (mmsi) => {
    setExpandedMmsi(prev => prev === mmsi ? null : mmsi);
  };

  const getRiskBadge = (tier, status) => {
    switch (tier) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/70 text-red-400 animate-pulse">
            PRIMARY SUSPECT
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/70 text-amber-300">
            PERSON OF INTEREST
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/80 border border-blue-500/50 text-blue-300">
            LOW PROBABILITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
            EXCLUDED
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 overflow-y-auto pr-1">
      {/* Header */}
      <div className="tactical-glass p-3 rounded-lg flex items-center justify-between border-cyan-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-950/80 border border-red-700/50 text-red-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Stage 5: Suspect Attribution
            </h2>
            <p className="text-[10px] text-slate-400">Ranked Spatio-Temporal Correlation</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
          5-FACTOR MODEL
        </span>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard && leaderboard.map((vessel, idx) => {
          const isExpanded = expandedMmsi === vessel.mmsi;
          const isSelected = selectedVessel?.mmsi === vessel.mmsi;
          const isHighSuspect = vessel.risk_tier === 'HIGH';

          // Chart data for speed profile
          const speedChartData = (vessel.trajectory || []).map((pt, pIdx) => ({
            time: `T-${12 - pIdx}h`,
            speed: pt.sog || 0,
            course: pt.cog || 0
          }));

          return (
            <div
              key={vessel.mmsi || idx}
              className={`tactical-glass rounded-lg border transition-all overflow-hidden ${
                isHighSuspect 
                  ? 'border-red-600/50 bg-red-950/20 shadow-md shadow-red-950/30' 
                  : isSelected 
                    ? 'border-cyan-500/60 bg-cyan-950/20' 
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Summary Bar */}
              <div 
                className="p-3 cursor-pointer select-none space-y-2"
                onClick={() => {
                  onSelectVessel(vessel);
                  toggleExpand(vessel.mmsi);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      idx === 0 ? 'bg-red-600 text-white' : idx === 1 ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{vessel.rank || idx + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5">
                        <span>{vessel.vessel_name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({vessel.flag})</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        MMSI: {vessel.mmsi} | Type: {vessel.vessel_type}
                      </p>
                    </div>
                  </div>

                  {getRiskBadge(vessel.risk_tier, vessel.status)}
                </div>

                {/* Score & Attribution Probability Gauge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">ATTRIBUTION CONFIDENCE:</span>
                    <span className={`font-bold ${isHighSuspect ? 'text-red-400' : 'text-cyan-300'}`}>
                      {vessel.suspect_score}% ({vessel.attribution_probability_pct}% of field)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighSuspect 
                          ? 'bg-gradient-to-r from-red-600 to-amber-500' 
                          : vessel.risk_tier === 'MEDIUM' 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                            : 'bg-cyan-600'
                      }`}
                      style={{ width: `${Math.min(100, vessel.suspect_score)}%` }}
                    />
                  </div>
                </div>

                {/* 5-Factor Contribution Preview Ticker */}
                <div className="grid grid-cols-5 gap-1 pt-1 text-[9px] font-mono text-center">
                  <div className="p-1 rounded bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-500">PROX (35%)</div>
                    <div className="text-cyan-300 font-bold">{vessel.factors?.proximity?.score?.toFixed(0)}%</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-500">TIME (25%)</div>
                    <div className="text-cyan-300 font-bold">{vessel.factors?.time_correlation?.score?.toFixed(0)}%</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-500">TRAJ (20%)</div>
                    <div className="text-cyan-300 font-bold">{vessel.factors?.trajectory_alignment?.score?.toFixed(0)}%</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-500">SPEED (10%)</div>
                    <div className="text-amber-300 font-bold">{vessel.factors?.speed_anomaly?.score?.toFixed(0)}%</div>
                  </div>
                  <div className="p-1 rounded bg-slate-900/90 border border-slate-800">
                    <div className="text-slate-500">BEHAV (10%)</div>
                    <div className="text-red-400 font-bold">{vessel.factors?.behavioral_anomaly?.score?.toFixed(0)}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-cyan-400/90 font-mono pt-1">
                  <span>{isExpanded ? 'Hide Forensic Details' : 'View Anomaly & Speed Profile'}</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Expanded Drill-Down Forensic Panel */}
              {isExpanded && (
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-3">
                  {/* Closest Approach Telemetry */}
                  <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Closest Approach to Origin:</span>
                      <span className="font-bold text-cyan-300">{vessel.factors?.proximity?.value_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Delta to Release:</span>
                      <span className="font-bold text-cyan-300">{vessel.factors?.time_correlation?.value_hours_delta} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vessel Heading at PCA:</span>
                      <span className="font-bold text-slate-200">{vessel.factors?.trajectory_alignment?.vessel_course_deg}°</span>
                    </div>
                  </div>

                  {/* Speed Profile Over Time (Line Chart) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-cyan-400" /> SOG (SPEED OVER GROUND) PROFILE (T-12h to T-0h)
                      </span>
                    </div>
                    <div className="h-28 w-full bg-slate-900/60 p-1 rounded border border-slate-800">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={speedChartData}>
                          <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="kts" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0284c7', fontSize: '10px' }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="speed" 
                            stroke={isHighSuspect ? '#ef4444' : '#38bdf8'} 
                            strokeWidth={2} 
                            dot={{ r: 2 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Anomaly Alerts List */}
                  {vessel.factors?.behavioral_anomaly?.flags?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> BEHAVIORAL ANOMALIES DETECTED:
                      </span>
                      {vessel.factors.behavioral_anomaly.flags.map((flag, fIdx) => (
                        <div key={fIdx} className="p-2 rounded bg-red-950/40 border border-red-800/60 text-[10px] font-mono text-red-200">
                          <span className="font-bold text-red-400">[{flag.type}]</span> {flag.detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
