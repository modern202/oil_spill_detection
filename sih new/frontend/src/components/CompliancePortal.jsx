import React, { useState } from 'react';
import { 
  X, 
  Anchor, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  FileCheck, 
  Send, 
  Eye, 
  UploadCloud,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompliancePortal({
  isOpen,
  onClose,
  scenarioId,
  onCitizenReportSubmitted
}) {
  const [activeTab, setActiveTab] = useState('compliance'); // 'compliance' or 'citizen'
  
  // Compliance check state
  const [mmsiInput, setMmsiInput] = useState('219018442'); // Defaults to Maersk Bengal (clean ship)
  const [vesselNameInput, setVesselNameInput] = useState('MV MAERSK BENGAL');
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);

  // Citizen report state
  const [reporterName, setReporterName] = useState('');
  const [craftName, setCraftName] = useState('');
  const [latInput, setLatInput] = useState('19.48');
  const [lonInput, setLonInput] = useState('71.45');
  const [description, setDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(null);

  if (!isOpen) return null;

  const handleRunComplianceCheck = async (e) => {
    e.preventDefault();
    setChecking(true);
    setCheckResult(null);

    try {
      const res = await fetch('/api/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mmsi: Number(mmsiInput),
          vessel_name: vesselNameInput,
          scenario_id: scenarioId
        })
      });
      const data = await res.json();
      setCheckResult(data);
      if (data.status.startsWith('COMPLIANT')) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmitCitizenReport = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch('/api/citizen-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_name: reporterName,
          craft_or_coastal_point: craftName,
          lat: Number(latInput),
          lon: Number(lonInput),
          description: description
        })
      });
      const data = await res.json();
      setReportSuccess(data);
      if (onCitizenReportSubmitted) onCitizenReportSubmitted();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="tactical-glass border-cyan-800/60 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl shadow-cyan-950/80">
        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-900/50 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('compliance')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'compliance' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Shipping Compliance Portal
              </button>
              <button
                onClick={() => setActiveTab('citizen')}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'citizen' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Citizen / Fisherfolk Sighting
              </button>
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
        <div className="p-5">
          {activeTab === 'compliance' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50 text-xs font-mono text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>OPERATOR SELF-MONITORING & EXONERATION VERIFIER</span>
                </div>
                <p className="text-slate-300">
                  Shipping companies and fleet operators can query their vessel's trajectory against the incident's hindcast release envelope to automatically obtain an official Clean Compliance Certificate.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleRunComplianceCheck} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">VESSEL MMSI (9-Digits):</label>
                  <input
                    type="number"
                    value={mmsiInput}
                    onChange={(e) => setMmsiInput(e.target.value)}
                    required
                    placeholder="e.g. 219018442"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">REGISTERED VESSEL NAME:</label>
                  <input
                    type="text"
                    value={vesselNameInput}
                    onChange={(e) => setVesselNameInput(e.target.value)}
                    required
                    placeholder="e.g. MV MAERSK BENGAL"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    disabled={checking}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950"
                  >
                    <Search className="w-4 h-4" />
                    <span>{checking ? 'Verifying Spatio-Temporal Corridor...' : 'Run Compliance Verification'}</span>
                  </button>
                </div>
              </form>

              {/* Certificate Result */}
              {checkResult && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  checkResult.status.startsWith('COMPLIANT')
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                    : 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      {checkResult.status.startsWith('COMPLIANT') ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 font-mono">
                          {checkResult.status.startsWith('COMPLIANT') ? 'CLEAN COMPLIANCE VERIFIED' : 'ATTRIBUTION ALERT'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">Certificate: {checkResult.certificate_id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      checkResult.status.startsWith('COMPLIANT') ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-300 border border-red-700'
                    }`}>
                      RISK: {checkResult.attribution_risk}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-200">{checkResult.message}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1">
                    <div>Vessel: <strong className="text-white">{checkResult.vessel_name}</strong></div>
                    <div>MMSI: <strong className="text-cyan-300">{checkResult.mmsi}</strong></div>
                    <div>Suspect Score: <strong className="text-amber-400">{checkResult.suspect_score}%</strong></div>
                    <div>Closest Approach: <strong className="text-slate-200">{checkResult.closest_approach_km || 'N/A'} km</strong></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-xs font-mono text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>COMMUNITY SENSOR NETWORK: REPORT SPILL SIGHTING</span>
                </div>
                <p className="text-slate-300">
                  Artisanal fishermen, port vessels, and coastal residents can log visual oil slicks to cross-corroborate Sentinel-1 satellite passes.
                </p>
              </div>

              {reportSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-100 font-mono">SIGHTING RECORDED SUCCESSFULLY</h4>
                  <p className="text-xs text-slate-300 font-mono">Report ID: <span className="text-cyan-400 font-bold">{reportSuccess.report_id}</span></p>
                  <p className="text-[11px] text-slate-400">Our automated ingestion pipeline will cross-match your observation with the next Copernicus satellite pass.</p>
                  <button
                    onClick={() => setReportSuccess(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 font-mono hover:bg-slate-700 cursor-pointer"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitCitizenReport} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">REPORTER NAME / AFFILIATION:</label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        required
                        placeholder="e.g. Anand Kumar (Fisherman Association)"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">CRAFT OR OBSERVATION POINT:</label>
                      <input
                        type="text"
                        value={craftName}
                        onChange={(e) => setCraftName(e.target.value)}
                        required
                        placeholder="e.g. Trawler 'Maa Durga IV'"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">LATITUDE (°N):</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={latInput}
                        onChange={(e) => setLatInput(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">LONGITUDE (°E):</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lonInput}
                        onChange={(e) => setLonInput(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">VISUAL DESCRIPTION & ODOR:</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={3}
                      placeholder="Describe color, sheen, diesel smell, drifting direction, dead fish etc."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingReport ? 'Transmitting Sighting...' : 'Broadcast Sighting to Coast Guard Engine'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
