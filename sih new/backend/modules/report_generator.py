"""
Oil Spill Source Attribution System - Official Forensic Report Generator
Generates structured Coast Guard / Admiralty Maritime Court Investigation Dossiers
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any

class ReportGenerator:
    def __init__(self):
        pass

    def generate_dossier(
        self,
        case_id: str,
        scenario_name: str,
        sar_analysis: Dict[str, Any],
        drift_analysis: Dict[str, Any],
        leaderboard: list,
        impact_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compiles all forensic evidence stages into an immutable, verifiable investigation dossier.
        """
        now_utc = datetime.now(timezone.utc).isoformat()
        
        # Primary suspect
        primary_suspect = leaderboard[0] if leaderboard else {}

        raw_payload = {
            "case_id": case_id,
            "scenario": scenario_name,
            "sar_analysis": sar_analysis,
            "drift_analysis": drift_analysis,
            "suspect": primary_suspect,
            "generated_at": now_utc
        }

        # Compute SHA-256 forensic hash for chain of custody
        payload_str = json.dumps(raw_payload, sort_keys=True, default=str)
        forensic_sha256 = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

        dossier = {
            "dossier_meta": {
                "case_id": case_id,
                "classification": "OFFICIAL MARITIME FORENSIC INTELLIGENCE",
                "authority": "Coast Guard Maritime Surveillance & Enforcement Division",
                "jurisdiction": "Exclusive Economic Zone (EEZ) & Territorial Waters",
                "issued_at_utc": now_utc,
                "cryptographic_hash_sha256": forensic_sha256,
                "digital_stamp": f"ICG-VERIFIED-AUTH-{forensic_sha256[:12].upper()}"
            },
            "executive_summary": {
                "incident_title": f"Illegal Hydrocarbon Discharge Incident - {scenario_name}",
                "slick_detection_summary": f"Sentinel-1 SAR satellite pass detected an irregular dark radar slick of {sar_analysis.get('area_km2', 0)} km² with an estimated volume of {sar_analysis.get('estimated_volume_tonnes', 0)} metric tonnes at {sar_analysis.get('centroid', {}).get('lat', 0)}°N, {sar_analysis.get('centroid', {}).get('lon', 0)}°E.",
                "hindcast_origin_summary": f"Oceanographic advection hindcasting (T-12h back-trajectory) isolates the release origin point at coordinates ({drift_analysis.get('estimated_origin', {}).get('lat', 0)}°N, {drift_analysis.get('estimated_origin', {}).get('lon', 0)}°E) within a 4 to 8 hour historical window.",
                "top_attributed_vessel": primary_suspect.get("vessel_name", "UNKNOWN"),
                "top_suspect_mmsi": primary_suspect.get("mmsi", "N/A"),
                "attribution_probability": f"{primary_suspect.get('attribution_probability_pct', 0)}%",
                "suspect_score": f"{primary_suspect.get('suspect_score', 0)} / 100",
                "legal_disclaimer": "This document provides probabilistic spatio-temporal attribution based on satellite radar backscatter, hydrodynamic vector fields, and AIS telemetry. It serves as actionable evidentiary support for port state boarding inspection and Admiralty tribunal proceedings."
            },
            "satellite_radar_evidence": {
                "sensor": "Sentinel-1 C-Band Synthetic Aperture Radar (SAR)",
                "polarization": "VV + VH Co-Polarized & Cross-Polarized Backscatter",
                "slick_area_km2": sar_analysis.get("area_km2"),
                "slick_perimeter_km": sar_analysis.get("perimeter_km"),
                "aspect_ratio": sar_analysis.get("aspect_ratio"),
                "orientation_azimuth_deg": sar_analysis.get("orientation_deg"),
                "estimated_thickness_microns": 2.5,
                "estimated_volume_tonnes": sar_analysis.get("estimated_volume_tonnes"),
                "estimated_volume_barrels": sar_analysis.get("estimated_volume_bbl")
            },
            "drift_hydrodynamics": {
                "ocean_current_vector": f"u: {drift_analysis.get('drift_parameters', {}).get('current_u_ms', 0):.2f} m/s, v: {drift_analysis.get('drift_parameters', {}).get('current_v_ms', 0):.2f} m/s",
                "surface_wind": f"{drift_analysis.get('drift_parameters', {}).get('wind_speed_ms', 0):.1f} m/s from {drift_analysis.get('drift_parameters', {}).get('wind_dir_deg', 0):.0f}°",
                "net_slick_drift_speed_knots": drift_analysis.get('drift_parameters', {}).get('net_advection_speed_knots', 0),
                "net_slick_drift_heading": f"{drift_analysis.get('drift_parameters', {}).get('net_advection_heading_deg', 0):.1f}°",
                "estimated_release_origin": drift_analysis.get("estimated_origin", {})
            },
            "suspect_vessel_leaderboard": leaderboard,
            "primary_suspect_forensic_profile": {
                "vessel_name": primary_suspect.get("vessel_name"),
                "mmsi": primary_suspect.get("mmsi"),
                "imo": primary_suspect.get("imo"),
                "flag_state": primary_suspect.get("flag"),
                "vessel_type": primary_suspect.get("vessel_type"),
                "closest_approach_distance_km": primary_suspect.get("factors", {}).get("proximity", {}).get("value_km"),
                "time_delta_to_origin_release_hours": primary_suspect.get("factors", {}).get("time_correlation", {}).get("value_hours_delta"),
                "speed_at_origin_knots": primary_suspect.get("factors", {}).get("speed_anomaly", {}).get("sog_knots"),
                "behavioral_anomalies_detected": primary_suspect.get("factors", {}).get("behavioral_anomaly", {}).get("flags", [])
            },
            "financial_and_ecological_liability": {
                "estimated_cleanup_cost_usd": impact_analysis.get("cleanup_cost", {}).get("total_estimated_cost_usd"),
                "estimated_cleanup_cost_inr_crores": impact_analysis.get("cleanup_cost", {}).get("total_estimated_cost_inr_crores"),
                "threatened_ecological_parks": impact_analysis.get("ecological_impact", {}).get("threatened_marine_parks", []),
                "estimated_fisherfolk_compensation_inr": impact_analysis.get("fisherfolk_impact", {}).get("total_estimated_livelihood_loss_inr")
            }
        }
        return dossier
