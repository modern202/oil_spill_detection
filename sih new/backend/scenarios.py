"""
Oil Spill Source Attribution System - Scenario Database & Synthetic Telemetry Generator
Pre-loaded realistic scenarios with Sentinel-1 SAR signatures, ocean currents, and AIS vessel tracks.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta

def generate_timestamp_series(base_time_str: str, num_pings: int, interval_minutes: int = 30) -> List[str]:
    """Generates an ISO timestamp sequence ending at base_time_str."""
    base_dt = datetime.fromisoformat(base_time_str.replace("Z", "+00:00"))
    timestamps = []
    for i in range(num_pings):
        t = base_dt - timedelta(minutes=(num_pings - 1 - i) * interval_minutes)
        timestamps.append(t.strftime("%Y-%m-%dT%H:%M:%SZ"))
    return timestamps

def get_preloaded_scenarios() -> Dict[str, Any]:
    # Common observation time
    obs_time = "2026-08-26T14:00:00Z"
    
    # -------------------------------------------------------------
    # Scenario 1: Mumbai High Offshore Oil Field & Arabian Sea Lane
    # -------------------------------------------------------------
    # Slick observed at 19.45°N, 71.42°E
    # Origin 6 hours ago was near 19.32°N, 71.18°E
    mumbai_times = generate_timestamp_series(obs_time, 13, interval_minutes=60) # T-12h to T-0h
    
    scenarios = {
        "mumbai_high": {
            "id": "mumbai_high",
            "name": "Mumbai High Offshore & Arabian Sea Chokepoint",
            "region": "Arabian Sea, Western EEZ of India",
            "threat_level": "HIGH",
            "observation_time": obs_time,
            "sar_center": {"lat": 19.4500, "lon": 71.4200},
            "ocean_data": {
                "current_u_ms": 0.28,      # Eastward current
                "current_v_ms": 0.14,      # Northward current
                "wind_speed_ms": 7.2,      # 7.2 m/s
                "wind_dir_deg": 230.0,     # SW monsoon wind
                "water_temp_c": 28.5,
                "sea_state": "Moderate (Wave height 1.6m)"
            },
            "sar_parameters": {
                "slick_center_px": [205, 195],
                "slick_axes_px": [72, 28],
                "slick_angle_deg": 48.0,
                "speckle_noise": 0.16,
                "threshold": 82
            },
            "candidate_vessels": [
                {
                    "mmsi": 352109840,
                    "vessel_name": "MT AL-ZAHRA",
                    "vessel_type": "VLCC Crude Oil Tanker",
                    "imo": 9482156,
                    "flag": "Panama",
                    "callsign": "3E2198",
                    "draft_m": 16.4,
                    "length_m": 333,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 19.08, "lon": 70.65, "sog": 14.2, "cog": 58.0},
                        {"timestamp": mumbai_times[1], "lat": 19.14, "lon": 70.78, "sog": 14.0, "cog": 58.0},
                        {"timestamp": mumbai_times[2], "lat": 19.20, "lon": 70.91, "sog": 13.8, "cog": 57.0},
                        {"timestamp": mumbai_times[3], "lat": 19.25, "lon": 71.02, "sog": 11.5, "cog": 56.0},
                        {"timestamp": mumbai_times[4], "lat": 19.29, "lon": 71.12, "sog": 6.8,  "cog": 52.0},
                        # At T-6h (Origin Zone Encounter): Slows down to 3.2 knots, makes an S-turn
                        {"timestamp": mumbai_times[5], "lat": 19.318, "lon": 71.176, "sog": 3.2, "cog": 112.0}, # DISCHARGE EVENT
                        {"timestamp": mumbai_times[6], "lat": 19.325, "lon": 71.195, "sog": 3.8, "cog": 85.0},
                        {"timestamp": mumbai_times[7], "lat": 19.345, "lon": 71.240, "sog": 7.4, "cog": 58.0},
                        {"timestamp": mumbai_times[8], "lat": 19.390, "lon": 71.340, "sog": 12.8, "cog": 58.0},
                        {"timestamp": mumbai_times[9], "lat": 19.450, "lon": 71.480, "sog": 14.1, "cog": 59.0},
                        {"timestamp": mumbai_times[10], "lat": 19.510, "lon": 71.610, "sog": 14.2, "cog": 58.0},
                        {"timestamp": mumbai_times[11], "lat": 19.570, "lon": 71.740, "sog": 14.3, "cog": 58.0},
                        {"timestamp": mumbai_times[12], "lat": 19.630, "lon": 71.870, "sog": 14.2, "cog": 58.0},
                    ]
                },
                {
                    "mmsi": 219018442,
                    "vessel_name": "MV MAERSK BENGAL",
                    "vessel_type": "Ultra Large Container Vessel",
                    "imo": 9728411,
                    "flag": "Denmark",
                    "callsign": "OXBM3",
                    "draft_m": 14.2,
                    "length_m": 399,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 19.28, "lon": 70.70, "sog": 18.5, "cog": 65.0},
                        {"timestamp": mumbai_times[1], "lat": 19.34, "lon": 70.88, "sog": 18.4, "cog": 65.0},
                        {"timestamp": mumbai_times[2], "lat": 19.40, "lon": 71.06, "sog": 18.6, "cog": 65.0},
                        {"timestamp": mumbai_times[3], "lat": 19.46, "lon": 71.24, "sog": 18.5, "cog": 65.0},
                        {"timestamp": mumbai_times[4], "lat": 19.52, "lon": 71.42, "sog": 18.4, "cog": 64.0},
                        {"timestamp": mumbai_times[5], "lat": 19.58, "lon": 71.60, "sog": 18.5, "cog": 65.0},
                        {"timestamp": mumbai_times[6], "lat": 19.64, "lon": 71.78, "sog": 18.6, "cog": 65.0},
                        {"timestamp": mumbai_times[7], "lat": 19.70, "lon": 71.96, "sog": 18.4, "cog": 65.0},
                        {"timestamp": mumbai_times[8], "lat": 19.76, "lon": 72.14, "sog": 18.5, "cog": 65.0},
                        {"timestamp": mumbai_times[9], "lat": 19.82, "lon": 72.32, "sog": 18.5, "cog": 65.0},
                        {"timestamp": mumbai_times[10], "lat": 19.88, "lon": 72.50, "sog": 18.4, "cog": 65.0},
                        {"timestamp": mumbai_times[11], "lat": 19.94, "lon": 72.68, "sog": 18.5, "cog": 65.0},
                        {"timestamp": mumbai_times[12], "lat": 20.00, "lon": 72.86, "sog": 18.5, "cog": 65.0},
                    ]
                },
                {
                    "mmsi": 419001122,
                    "vessel_name": "ICGS SAMUDRA PAVAK",
                    "vessel_type": "Pollution Control Vessel (Coast Guard)",
                    "imo": 9631175,
                    "flag": "India",
                    "callsign": "AWDK",
                    "draft_m": 4.5,
                    "length_m": 94,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 19.60, "lon": 71.20, "sog": 11.2, "cog": 175.0},
                        {"timestamp": mumbai_times[1], "lat": 19.52, "lon": 71.22, "sog": 11.0, "cog": 175.0},
                        {"timestamp": mumbai_times[2], "lat": 19.44, "lon": 71.24, "sog": 10.8, "cog": 175.0},
                        {"timestamp": mumbai_times[3], "lat": 19.38, "lon": 71.25, "sog": 11.0, "cog": 175.0},
                        {"timestamp": mumbai_times[4], "lat": 19.35, "lon": 71.26, "sog": 10.5, "cog": 175.0},
                        {"timestamp": mumbai_times[5], "lat": 19.36, "lon": 71.30, "sog": 8.0,  "cog": 90.0},
                        {"timestamp": mumbai_times[6], "lat": 19.37, "lon": 71.36, "sog": 8.5,  "cog": 85.0},
                        {"timestamp": mumbai_times[7], "lat": 19.38, "lon": 71.42, "sog": 9.0,  "cog": 80.0},
                        {"timestamp": mumbai_times[8], "lat": 19.40, "lon": 71.46, "sog": 9.2,  "cog": 70.0},
                        {"timestamp": mumbai_times[9], "lat": 19.42, "lon": 71.50, "sog": 9.5,  "cog": 65.0},
                        {"timestamp": mumbai_times[10], "lat": 19.45, "lon": 71.54, "sog": 9.5, "cog": 60.0},
                        {"timestamp": mumbai_times[11], "lat": 19.48, "lon": 71.58, "sog": 9.0, "cog": 55.0},
                        {"timestamp": mumbai_times[12], "lat": 19.50, "lon": 71.62, "sog": 9.0, "cog": 50.0},
                    ]
                },
                {
                    "mmsi": 419882310,
                    "vessel_name": "SAGAR KANYA II",
                    "vessel_type": "Deep Sea Trawler",
                    "imo": 0,
                    "flag": "India",
                    "callsign": "VT882",
                    "draft_m": 2.8,
                    "length_m": 24,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 19.62, "lon": 70.95, "sog": 4.5, "cog": 120.0},
                        {"timestamp": mumbai_times[1], "lat": 19.60, "lon": 71.00, "sog": 4.2, "cog": 125.0},
                        {"timestamp": mumbai_times[2], "lat": 19.58, "lon": 71.04, "sog": 4.0, "cog": 130.0},
                        {"timestamp": mumbai_times[3], "lat": 19.57, "lon": 71.08, "sog": 3.8, "cog": 110.0},
                        {"timestamp": mumbai_times[4], "lat": 19.58, "lon": 71.12, "sog": 4.1, "cog": 70.0},
                        {"timestamp": mumbai_times[5], "lat": 19.59, "lon": 71.16, "sog": 4.0, "cog": 75.0},
                        {"timestamp": mumbai_times[6], "lat": 19.60, "lon": 71.20, "sog": 4.2, "cog": 80.0},
                        {"timestamp": mumbai_times[7], "lat": 19.61, "lon": 71.24, "sog": 4.1, "cog": 80.0},
                        {"timestamp": mumbai_times[8], "lat": 19.62, "lon": 71.28, "sog": 4.3, "cog": 85.0},
                        {"timestamp": mumbai_times[9], "lat": 19.63, "lon": 71.32, "sog": 4.0, "cog": 90.0},
                        {"timestamp": mumbai_times[10], "lat": 19.64, "lon": 71.36, "sog": 4.2, "cog": 85.0},
                        {"timestamp": mumbai_times[11], "lat": 19.65, "lon": 71.40, "sog": 4.1, "cog": 80.0},
                        {"timestamp": mumbai_times[12], "lat": 19.66, "lon": 71.44, "sog": 4.0, "cog": 85.0},
                    ]
                }
            ]
        },

        # -------------------------------------------------------------
        # Scenario 2: Bay of Bengal / Paradip - Sundarbans Reserve
        # -------------------------------------------------------------
        "sundarbans_threat": {
            "id": "sundarbans_threat",
            "name": "Bay of Bengal & Sundarbans Mangrove Approach",
            "region": "Northern Bay of Bengal / Odisha - Bengal Coast",
            "threat_level": "CRITICAL",
            "observation_time": obs_time,
            "sar_center": {"lat": 21.1500, "lon": 88.3500},
            "ocean_data": {
                "current_u_ms": 0.32,      # East-Northeastward
                "current_v_ms": 0.22,
                "wind_speed_ms": 8.5,
                "wind_dir_deg": 205.0,
                "water_temp_c": 29.1,
                "sea_state": "Rough (Wave height 2.2m)"
            },
            "sar_parameters": {
                "slick_center_px": [190, 210],
                "slick_axes_px": [85, 32],
                "slick_angle_deg": 56.0,
                "speckle_noise": 0.19,
                "threshold": 80
            },
            "candidate_vessels": [
                {
                    "mmsi": 636019871,
                    "vessel_name": "MV PACIFIC EMERALD",
                    "vessel_type": "Capesize Bulk Carrier",
                    "imo": 9511204,
                    "flag": "Liberia",
                    "callsign": "D5LY9",
                    "draft_m": 17.8,
                    "length_m": 292,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 20.72, "lon": 87.60, "sog": 13.5, "cog": 45.0},
                        {"timestamp": mumbai_times[1], "lat": 20.79, "lon": 87.72, "sog": 13.4, "cog": 45.0},
                        {"timestamp": mumbai_times[2], "lat": 20.86, "lon": 87.84, "sog": 13.2, "cog": 45.0},
                        {"timestamp": mumbai_times[3], "lat": 20.93, "lon": 87.96, "sog": 10.0, "cog": 45.0},
                        {"timestamp": mumbai_times[4], "lat": 20.98, "lon": 88.05, "sog": 4.2,  "cog": 65.0},
                        # Culprit bilgewater discharge at T-6h near 21.01°N, 88.10°E
                        {"timestamp": mumbai_times[5], "lat": 21.012, "lon": 88.105, "sog": 2.8, "cog": 95.0}, # DISCHARGE
                        {"timestamp": mumbai_times[6], "lat": 21.025, "lon": 88.130, "sog": 3.4, "cog": 70.0},
                        {"timestamp": mumbai_times[7], "lat": 21.060, "lon": 88.190, "sog": 8.0, "cog": 45.0},
                        {"timestamp": mumbai_times[8], "lat": 21.130, "lon": 88.310, "sog": 13.1, "cog": 45.0},
                        {"timestamp": mumbai_times[9], "lat": 21.200, "lon": 88.430, "sog": 13.5, "cog": 45.0},
                        {"timestamp": mumbai_times[10], "lat": 21.270, "lon": 88.550, "sog": 13.6, "cog": 45.0},
                        {"timestamp": mumbai_times[11], "lat": 21.340, "lon": 88.670, "sog": 13.5, "cog": 45.0},
                        {"timestamp": mumbai_times[12], "lat": 21.410, "lon": 88.790, "sog": 13.5, "cog": 45.0},
                    ]
                },
                {
                    "mmsi": 419000845,
                    "vessel_name": "MT GANGA PIONEER",
                    "vessel_type": "Chemical / Oil Products Tanker",
                    "imo": 9410985,
                    "flag": "India",
                    "callsign": "AUJY",
                    "draft_m": 9.8,
                    "length_m": 182,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 20.85, "lon": 88.20, "sog": 12.0, "cog": 10.0},
                        {"timestamp": mumbai_times[1], "lat": 20.94, "lon": 88.22, "sog": 12.1, "cog": 10.0},
                        {"timestamp": mumbai_times[2], "lat": 21.03, "lon": 88.24, "sog": 11.9, "cog": 10.0},
                        {"timestamp": mumbai_times[3], "lat": 21.12, "lon": 88.26, "sog": 12.0, "cog": 10.0},
                        {"timestamp": mumbai_times[4], "lat": 21.21, "lon": 88.28, "sog": 12.1, "cog": 10.0},
                        {"timestamp": mumbai_times[5], "lat": 21.30, "lon": 88.30, "sog": 12.0, "cog": 10.0},
                        {"timestamp": mumbai_times[6], "lat": 21.39, "lon": 88.32, "sog": 11.8, "cog": 10.0},
                        {"timestamp": mumbai_times[7], "lat": 21.48, "lon": 88.34, "sog": 12.0, "cog": 10.0},
                        {"timestamp": mumbai_times[8], "lat": 21.57, "lon": 88.36, "sog": 12.1, "cog": 10.0},
                        {"timestamp": mumbai_times[9], "lat": 21.66, "lon": 88.38, "sog": 12.0, "cog": 10.0},
                        {"timestamp": mumbai_times[10], "lat": 21.75, "lon": 88.40, "sog": 11.9, "cog": 10.0},
                        {"timestamp": mumbai_times[11], "lat": 21.84, "lon": 88.42, "sog": 12.0, "cog": 10.0},
                        {"timestamp": mumbai_times[12], "lat": 21.93, "lon": 88.44, "sog": 12.0, "cog": 10.0},
                    ]
                }
            ]
        },

        # -------------------------------------------------------------
        # Scenario 3: Gulf of Mannar Coral Biosphere Reserve
        # -------------------------------------------------------------
        "gulf_of_mannar": {
            "id": "gulf_of_mannar",
            "name": "Gulf of Mannar Coral Biosphere Reserve",
            "region": "Tamil Nadu & Palk Strait Coral Marine Park",
            "threat_level": "CRITICAL",
            "observation_time": obs_time,
            "sar_center": {"lat": 9.0800, "lon": 79.2500},
            "ocean_data": {
                "current_u_ms": -0.18,     # Westward
                "current_v_ms": 0.12,      # Northward
                "wind_speed_ms": 5.8,
                "wind_dir_deg": 135.0,     # SE trade wind
                "water_temp_c": 30.2,
                "sea_state": "Calm to Slight (Wave height 0.8m)"
            },
            "sar_parameters": {
                "slick_center_px": [210, 190],
                "slick_axes_px": [55, 22],
                "slick_angle_deg": 125.0,
                "speckle_noise": 0.14,
                "threshold": 84
            },
            "candidate_vessels": [
                {
                    "mmsi": 538008712,
                    "vessel_name": "MT COROMANDEL STAR",
                    "vessel_type": "Medium Range Product Tanker",
                    "imo": 9390214,
                    "flag": "Marshall Islands",
                    "callsign": "V7AP4",
                    "draft_m": 11.2,
                    "length_m": 183,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 8.85, "lon": 79.60, "sog": 12.8, "cog": 310.0},
                        {"timestamp": mumbai_times[1], "lat": 8.91, "lon": 79.53, "sog": 12.6, "cog": 310.0},
                        {"timestamp": mumbai_times[2], "lat": 8.97, "lon": 79.46, "sog": 12.5, "cog": 310.0},
                        {"timestamp": mumbai_times[3], "lat": 9.02, "lon": 79.40, "sog": 9.2,  "cog": 305.0},
                        {"timestamp": mumbai_times[4], "lat": 9.05, "lon": 79.35, "sog": 3.5,  "cog": 290.0},
                        {"timestamp": mumbai_times[5], "lat": 9.062, "lon": 79.325, "sog": 2.4, "cog": 260.0}, # DISCHARGE
                        {"timestamp": mumbai_times[6], "lat": 9.070, "lon": 79.290, "sog": 4.1, "cog": 295.0},
                        {"timestamp": mumbai_times[7], "lat": 9.100, "lon": 79.230, "sog": 9.5, "cog": 315.0},
                        {"timestamp": mumbai_times[8], "lat": 9.160, "lon": 79.150, "sog": 12.8, "cog": 315.0},
                        {"timestamp": mumbai_times[9], "lat": 9.220, "lon": 79.070, "sog": 12.9, "cog": 315.0},
                        {"timestamp": mumbai_times[10], "lat": 9.280, "lon": 78.990, "sog": 13.0, "cog": 315.0},
                        {"timestamp": mumbai_times[11], "lat": 9.340, "lon": 78.910, "sog": 13.0, "cog": 315.0},
                        {"timestamp": mumbai_times[12], "lat": 9.400, "lon": 78.830, "sog": 12.9, "cog": 315.0},
                    ]
                },
                {
                    "mmsi": 417000214,
                    "vessel_name": "MV LANKA PRIDE",
                    "vessel_type": "Container Feeder",
                    "imo": 9284152,
                    "flag": "Sri Lanka",
                    "callsign": "4QLP",
                    "draft_m": 7.5,
                    "length_m": 140,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 8.70, "lon": 79.80, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[1], "lat": 8.78, "lon": 79.74, "sog": 14.4, "cog": 330.0},
                        {"timestamp": mumbai_times[2], "lat": 8.86, "lon": 79.68, "sog": 14.6, "cog": 330.0},
                        {"timestamp": mumbai_times[3], "lat": 8.94, "lon": 79.62, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[4], "lat": 9.02, "lon": 79.56, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[5], "lat": 9.10, "lon": 79.50, "sog": 14.4, "cog": 330.0},
                        {"timestamp": mumbai_times[6], "lat": 9.18, "lon": 79.44, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[7], "lat": 9.26, "lon": 79.38, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[8], "lat": 9.34, "lon": 79.32, "sog": 14.6, "cog": 330.0},
                        {"timestamp": mumbai_times[9], "lat": 9.42, "lon": 79.26, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[10], "lat": 9.50, "lon": 79.20, "sog": 14.4, "cog": 330.0},
                        {"timestamp": mumbai_times[11], "lat": 9.58, "lon": 79.14, "sog": 14.5, "cog": 330.0},
                        {"timestamp": mumbai_times[12], "lat": 9.66, "lon": 79.08, "sog": 14.5, "cog": 330.0},
                    ]
                }
            ]
        },

        # -------------------------------------------------------------
        # Scenario 4: Strait of Malacca / Singapore Approaches
        # -------------------------------------------------------------
        "malacca_strait": {
            "id": "malacca_strait",
            "name": "Strait of Malacca Traffic Separation Scheme",
            "region": "Singapore & Malacca International Chokepoint",
            "threat_level": "HIGH",
            "observation_time": obs_time,
            "sar_center": {"lat": 1.2500, "lon": 103.6500},
            "ocean_data": {
                "current_u_ms": -0.25,     # Northwestward through strait
                "current_v_ms": 0.20,
                "wind_speed_ms": 4.5,
                "wind_dir_deg": 120.0,
                "water_temp_c": 29.8,
                "sea_state": "Smooth (Wave height 0.6m)"
            },
            "sar_parameters": {
                "slick_center_px": [200, 200],
                "slick_axes_px": [68, 25],
                "slick_angle_deg": 130.0,
                "speckle_noise": 0.15,
                "threshold": 83
            },
            "candidate_vessels": [
                {
                    "mmsi": 477192800,
                    "vessel_name": "MT OCEAN VOYAGER",
                    "vessel_type": "Aframax Crude Tanker",
                    "imo": 9621189,
                    "flag": "Hong Kong",
                    "callsign": "VRKM8",
                    "draft_m": 14.5,
                    "length_m": 245,
                    "trajectory": [
                        {"timestamp": mumbai_times[0], "lat": 1.10, "lon": 103.88, "sog": 13.0, "cog": 305.0},
                        {"timestamp": mumbai_times[1], "lat": 1.14, "lon": 103.82, "sog": 12.8, "cog": 305.0},
                        {"timestamp": mumbai_times[2], "lat": 1.18, "lon": 103.76, "sog": 12.5, "cog": 305.0},
                        {"timestamp": mumbai_times[3], "lat": 1.21, "lon": 103.71, "sog": 8.0,  "cog": 300.0},
                        {"timestamp": mumbai_times[4], "lat": 1.23, "lon": 103.68, "sog": 3.8,  "cog": 290.0},
                        {"timestamp": mumbai_times[5], "lat": 1.242, "lon": 103.662, "sog": 2.5, "cog": 280.0}, # DISCHARGE
                        {"timestamp": mumbai_times[6], "lat": 1.255, "lon": 103.635, "sog": 4.2, "cog": 305.0},
                        {"timestamp": mumbai_times[7], "lat": 1.290, "lon": 103.580, "sog": 9.0, "cog": 305.0},
                        {"timestamp": mumbai_times[8], "lat": 1.340, "lon": 103.500, "sog": 13.0, "cog": 305.0},
                        {"timestamp": mumbai_times[9], "lat": 1.390, "lon": 103.420, "sog": 13.2, "cog": 305.0},
                        {"timestamp": mumbai_times[10], "lat": 1.440, "lon": 103.340, "sog": 13.1, "cog": 305.0},
                        {"timestamp": mumbai_times[11], "lat": 1.490, "lon": 103.260, "sog": 13.0, "cog": 305.0},
                        {"timestamp": mumbai_times[12], "lat": 1.540, "lon": 103.180, "sog": 13.1, "cog": 305.0},
                    ]
                }
            ]
        }
    }
    return scenarios
