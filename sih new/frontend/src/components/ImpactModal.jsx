import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  ShieldAlert, 
  Fish, 
  Globe2, 
  Layers, 
  AlertOctagon, 
  Copy, 
  Check, 
  Send,
  Building,
  HeartHandshake
} from 'lucide-react';

export default function ImpactModal({ isOpen, onClose, impactData, scenarioName }) {
  const [selectedLang, setSelectedLang] = useState('english');
  const [copied, setCopied] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  if (!isOpen || !impactData) return null;

  const { cleanup_cost, ecological_impact, fisherfolk_impact, coastal_alerts } = impactData;
  const currentAlert = coastal_alerts ? coastal_alerts[selectedLang] : null;

  const handleCopyAlert = () => {
    if (currentAlert) {
      navigator.clipboard.writeText(currentAlert.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="tactical-glass border-cyan-800/60 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl shadow-cyan-950/80">
        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-900/50 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Institutional, Ecological & Community Impact Suite
              </h2>
              <p className="text-xs text-slate-400">Incident: {scenarioName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* 1. ASTM / ITOPF Cleanup Cost Estimator */}
          <div className="tactical-glass p-4 rounded-lg border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                1. ITOPF Cleanup & Response Cost Model
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-600 text-emerald-300">
                {cleanup_cost?.response_tier}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono">TOTAL ESTIMATED COST (INR)</span>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                  ₹ {cleanup_cost?.total_estimated_cost_inr_crores} <span className="text-xs">Crores</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Based on 1 USD = 86.5 INR</span>
              </div>

              <div className="p-3 rounded bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono">TOTAL ESTIMATED COST (USD)</span>
                <div className="text-xl font-bold text-cyan-300 font-mono mt-1">
                  ${cleanup_cost?.total_estimated_cost_usd?.toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">ITOPF Benchmark Tier</span>
              </div>

              <div className="p-3 rounded bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono">BOOM & SKIMMER REQ.</span>
                <div className="text-xs font-mono text-slate-200 mt-1 space-y-0.5">
                  <p>Booms: <span className="text-cyan-400 font-bold">{cleanup_cost?.cost_breakdown?.boom_length_required_m} m</span></p>
                  <p>Skimmer Ops: <span className="text-amber-400 font-bold">{cleanup_cost?.cost_breakdown?.operational_duration_days} days</span></p>
                </div>
              </div>
            </div>

            {/* Itemized Cost Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono border-t border-slate-800/80">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Containment Booming:</span>
                <p className="text-cyan-300 font-bold">${cleanup_cost?.cost_breakdown?.containment_booming_usd?.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Skimmer Vessel Ops:</span>
                <p className="text-cyan-300 font-bold">${cleanup_cost?.cost_breakdown?.skimmer_vessel_operations_usd?.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Dispersant Operations:</span>
                <p className="text-cyan-300 font-bold">${cleanup_cost?.cost_breakdown?.chemical_dispersant_usd?.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Hazardous Waste Disposal:</span>
                <p className="text-cyan-300 font-bold">${cleanup_cost?.cost_breakdown?.hazardous_waste_disposal_usd?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 2. Ecological Sensitivity Assessment */}
          <div className="tactical-glass p-4 rounded-lg border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                2. Ecological Sensitivity & Marine Park Intersection
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                ecological_impact?.overall_ecological_risk === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-600' : 'bg-amber-950 text-amber-300 border border-amber-600'
              }`}>
                RISK: {ecological_impact?.overall_ecological_risk}
              </span>
            </div>

            {ecological_impact?.threatened_marine_parks?.length > 0 ? (
              <div className="space-y-2">
                {ecological_impact.threatened_marine_parks.map((park, pIdx) => (
                  <div key={pIdx} className="p-3 rounded bg-red-950/20 border border-red-800/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-red-300 font-mono">{park.name}</h4>
                        <p className="text-[10px] text-slate-400">{park.state} | {park.ecosystem_type}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 border border-red-700 text-red-400">
                        {park.threat_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                      <span>Proximity: <strong className="text-cyan-300">{park.distance_km} km</strong></span>
                      {park.time_to_impact_hours && (
                        <span>| Projected Impact in: <strong className="text-red-400">{park.time_to_impact_hours} hours</strong></span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Endangered Fauna: <span className="text-amber-300">{park.species_at_risk.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                No direct collision with declared Marine Protected Areas in current 24-hour dispersion envelope.
              </div>
            )}

            <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-900 text-xs font-mono text-cyan-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{ecological_impact?.immediate_action_recommendation}</span>
            </div>
          </div>

          {/* 3. Fisherfolk Livelihood Impact */}
          <div className="tactical-glass p-4 rounded-lg border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Fish className="w-4 h-4 text-blue-400" />
                3. Fisherfolk Community Livelihood Impact
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{fisherfolk_impact?.region}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">EXCLUSION ZONE</span>
                <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                  {fisherfolk_impact?.exclusion_zone_area_km2} <span className="text-xs">km²</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Security buffer applied</span>
              </div>

              <div className="p-3 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">AFFECTED CRAFT & CREW</span>
                <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                  {fisherfolk_impact?.estimated_affected_vessels} <span className="text-xs">Boats</span> / {fisherfolk_impact?.affected_active_fisherfolk} <span className="text-xs">Crew</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">14-day mandatory ban</span>
              </div>

              <div className="p-3 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">TOTAL RELIEF COMP.</span>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  ₹ {fisherfolk_impact?.total_compensation_crores} <span className="text-xs">Crores</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">₹{fisherfolk_impact?.total_estimated_livelihood_loss_inr?.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-blue-950/40 border border-blue-900 text-xs font-mono text-blue-200 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{fisherfolk_impact?.relief_scheme_recommendation}</span>
            </div>
          </div>

          {/* 4. Multi-Language Coastal Emergency Alerts */}
          <div className="tactical-glass p-4 rounded-lg border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                4. Multi-Language Coastal Emergency Warning Broadcast
              </h3>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
                {['english', 'hindi', 'bengali', 'odia', 'tamil'].map((langKey) => (
                  <button
                    key={langKey}
                    onClick={() => setSelectedLang(langKey)}
                    className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                      selectedLang === langKey ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {langKey}
                  </button>
                ))}
              </div>
            </div>

            {currentAlert && (
              <div className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 font-sans">{currentAlert.headline}</h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyAlert}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleBroadcastAlert}
                      className="px-2 py-1 rounded bg-red-900/80 hover:bg-red-800 text-red-100 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{broadcastSent ? 'SMS Broadcast Sent!' : 'Push SMS Alert'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{currentAlert.body}</p>
                <div className="p-2 rounded bg-slate-950 text-[10px] font-mono text-cyan-300 border border-slate-800">
                  SMS Preview: {currentAlert.sms_short}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
