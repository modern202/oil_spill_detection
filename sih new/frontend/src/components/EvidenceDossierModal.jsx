import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Satellite, 
  Compass, 
  Award, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';

export default function EvidenceDossierModal({ isOpen, onClose, dossierData }) {
  if (!isOpen || !dossierData) return null;

  const {
    dossier_meta,
    executive_summary,
    satellite_radar_evidence,
    drift_hydrodynamics,
    suspect_vessel_leaderboard,
    primary_suspect_forensic_profile,
    financial_and_ecological_liability
  } = dossierData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="tactical-glass border-cyan-700/60 rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl shadow-cyan-950/80 bg-slate-950">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-cyan-900/50 flex items-center justify-between sticky top-0 bg-slate-950/95 z-10 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wider">
              MARITIME FORENSIC EVIDENCE DOSSIER
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-cyan-900"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / SAVE PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Content */}
        <div className="p-8 space-y-6 text-slate-200 font-sans leading-normal">
          {/* Official Document Banner */}
          <div className="border-b-2 border-cyan-500 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold">
                {dossier_meta?.classification}
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide font-mono mt-0.5">
                INCIDENT INVESTIGATION & ATTRIBUTION REPORT
              </h1>
              <p className="text-xs text-slate-400 font-mono">{dossier_meta?.authority}</p>
            </div>
            <div className="text-right font-mono text-[11px] space-y-0.5">
              <p className="text-cyan-300 font-bold">CASE ID: {dossier_meta?.case_id}</p>
              <p className="text-slate-400">ISSUED: {dossier_meta?.issued_at_utc?.substring(0, 19)}Z</p>
              <span className="inline-block px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] font-bold">
                {dossier_meta?.digital_stamp}
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider border-b border-slate-800 pb-1">
              1. Executive Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{executive_summary?.slick_detection_summary}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{executive_summary?.hindcast_origin_summary}</p>

            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs mt-2">
              <div>
                <span className="text-[10px] text-slate-400">PRIMARY ATTRIBUTED SUSPECT:</span>
                <p className="text-sm font-bold text-red-400">{executive_summary?.top_attributed_vessel}</p>
                <span className="text-[10px] text-slate-400">MMSI: {executive_summary?.top_suspect_mmsi}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">ATTRIBUTION CONFIDENCE:</span>
                <p className="text-sm font-bold text-red-400">{executive_summary?.attribution_probability}</p>
                <span className="text-[10px] text-slate-400">Normalized Field Score</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">SUSPECT SCORE (5-FACTOR):</span>
                <p className="text-sm font-bold text-amber-300">{executive_summary?.suspect_score}</p>
                <span className="text-[10px] text-slate-400">Standardized Metric</span>
              </div>
            </div>
          </div>

          {/* Section 2: Satellite Radar & Geometry */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider border-b border-slate-800 pb-1">
              2. Sentinel-1 SAR Radar Telemetry & Slick Morphology
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Sensor / Band:</span>
                <p className="text-slate-200 font-bold">{satellite_radar_evidence?.sensor}</p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Slick Area:</span>
                <p className="text-cyan-300 font-bold">{satellite_radar_evidence?.slick_area_km2} km²</p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Estimated Volume:</span>
                <p className="text-red-400 font-bold">{satellite_radar_evidence?.estimated_volume_tonnes} tonnes</p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Slick Azimuth:</span>
                <p className="text-amber-300 font-bold">{satellite_radar_evidence?.orientation_azimuth_deg}°</p>
              </div>
            </div>
          </div>

          {/* Section 3: Hydrodynamic Hindcast & AIS Attribution */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider border-b border-slate-800 pb-1">
              3. Spatio-Temporal Suspect Vessel Leaderboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-slate-800 rounded">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-2">Rank</th>
                    <th className="p-2">Vessel Name</th>
                    <th className="p-2">MMSI</th>
                    <th className="p-2">Type / Flag</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Attribution %</th>
                    <th className="p-2">Risk Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {suspect_vessel_leaderboard && suspect_vessel_leaderboard.map((v, i) => (
                    <tr key={i} className={i === 0 ? 'bg-red-950/20 text-red-200' : 'text-slate-300'}>
                      <td className="p-2 font-bold">#{v.rank}</td>
                      <td className="p-2 font-bold text-white">{v.vessel_name}</td>
                      <td className="p-2">{v.mmsi}</td>
                      <td className="p-2">{v.vessel_type} ({v.flag})</td>
                      <td className="p-2 font-bold text-cyan-300">{v.suspect_score}%</td>
                      <td className="p-2 font-bold text-amber-300">{v.attribution_probability_pct}%</td>
                      <td className="p-2 font-bold">{v.risk_tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Primary Suspect Anomaly Breakdown */}
          {primary_suspect_forensic_profile && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider border-b border-slate-800 pb-1">
                4. Primary Suspect Behavioral & Telemetry Profile
              </h3>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>PCA Distance: <strong className="text-cyan-300">{primary_suspect_forensic_profile.closest_approach_distance_km} km</strong></div>
                  <div>Release Window Delta: <strong className="text-cyan-300">{primary_suspect_forensic_profile.time_delta_to_origin_release_hours} hours</strong></div>
                  <div>Discharge Speed: <strong className="text-amber-400">{primary_suspect_forensic_profile.speed_at_origin_knots} kts</strong></div>
                  <div>Flag State: <strong className="text-white">{primary_suspect_forensic_profile.flag_state}</strong></div>
                </div>

                {primary_suspect_forensic_profile.behavioral_anomalies_detected?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] text-red-400 font-bold">ANOMALY LOG:</span>
                    {primary_suspect_forensic_profile.behavioral_anomalies_detected.map((fl, fIdx) => (
                      <div key={fIdx} className="text-[11px] text-red-300">
                        • [{fl.type}] {fl.detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Financial & Ecological Liabilities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider border-b border-slate-800 pb-1">
              5. Response Cost & Community Damage Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Total Containment & Cleanup Liability:</span>
                <p className="text-base font-bold text-emerald-400 mt-1">
                  ₹ {financial_and_ecological_liability?.estimated_cleanup_cost_inr_crores} Crores (${financial_and_ecological_liability?.estimated_cleanup_cost_usd?.toLocaleString()} USD)
                </p>
              </div>
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Fisherfolk Livelihood Compensation Fund:</span>
                <p className="text-base font-bold text-cyan-300 mt-1">
                  ₹ {financial_and_ecological_liability?.estimated_fisherfolk_compensation_inr?.toLocaleString()} INR
                </p>
              </div>
            </div>
          </div>

          {/* Forensic Hash Seal */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-slate-200 font-bold">CRYPTOGRAPHIC FORENSIC INTEGRITY SEAL (SHA-256)</p>
                <p className="text-cyan-400">{dossier_meta?.cryptographic_hash_sha256}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">DIGITALLY VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
