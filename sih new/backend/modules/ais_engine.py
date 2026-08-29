"""
Oil Spill Source Attribution System - AIS Trajectory & Spatio-Temporal Query Engine
Stage 4: AIS historical trajectory reconstruction, filtering & anomaly detection
"""

import math
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two geographic coordinates in kilometers."""
    R = 6371.0 # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_initial_compass_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates initial bearing (azimuth in degrees) from point 1 to point 2."""
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    diff_lon_r = math.radians(lon2 - lon1)

    x = math.sin(diff_lon_r) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - (math.sin(lat1_r) * math.cos(lat2_r) * math.cos(diff_lon_r))
    initial_bearing = math.atan2(x, y)
    compass_bearing = (math.degrees(initial_bearing) + 360.0) % 360.0
    return compass_bearing

class AISEngine:
    def __init__(self):
        pass

    def reconstruct_trajectory(self, raw_pings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sorts, interpolates, and enriches raw AIS pings with computed intervals,
        acceleration, turn rates, and speed status.
        """
        if not raw_pings:
            return []

        # Sort by timestamp
        sorted_pings = sorted(raw_pings, key=lambda p: p["timestamp"])
        enriched_pings = []

        for i, ping in enumerate(sorted_pings):
            p = dict(ping)
            if i > 0:
                prev = sorted_pings[i - 1]
                # Distance and time interval
                dist_km = haversine_distance_km(prev["lat"], prev["lon"], p["lat"], p["lon"])
                t_prev = datetime.fromisoformat(prev["timestamp"].replace("Z", "+00:00"))
                t_curr = datetime.fromisoformat(p["timestamp"].replace("Z", "+00:00"))
                dt_hours = max(0.001, (t_curr - t_prev).total_seconds() / 3600.0)
                
                computed_speed_knots = (dist_km / 1.852) / dt_hours
                computed_course = calculate_initial_compass_bearing(prev["lat"], prev["lon"], p["lat"], p["lon"])

                # Speed change and course delta
                speed_delta = p.get("sog", computed_speed_knots) - prev.get("sog", computed_speed_knots)
                course_delta = abs((p.get("cog", computed_course) - prev.get("cog", computed_course) + 180) % 360 - 180)

                p["segment_dist_km"] = round(dist_km, 2)
                p["dt_minutes"] = round(dt_hours * 60.0, 1)
                p["speed_delta_knots"] = round(speed_delta, 2)
                p["course_delta_deg"] = round(course_delta, 1)
                p["computed_speed_knots"] = round(computed_speed_knots, 2)
            else:
                p["segment_dist_km"] = 0.0
                p["dt_minutes"] = 0.0
                p["speed_delta_knots"] = 0.0
                p["course_delta_deg"] = 0.0
                p["computed_speed_knots"] = p.get("sog", 0.0)

            enriched_pings.append(p)

        return enriched_pings

    def detect_vessel_anomalies(
        self,
        trajectory: List[Dict[str, Any]],
        vessel_type: str = "Tanker",
        normal_speed_range: Tuple[float, float] = (10.0, 16.0)
    ) -> Dict[str, Any]:
        """
        Detects operational anomalies along trajectory:
        - Sudden speed drop (e.g. slowing down to 2-3 knots to discharge ballast/bilge water)
        - Loitering / drifting in open sea lane
        - Sharp erratic course shifts
        - AIS transmission gap (deliberate transponder silencing)
        """
        if len(trajectory) < 2:
            return {"has_anomalies": False, "anomaly_score": 0.0, "anomaly_flags": []}

        min_speed = min(p.get("sog", 12.0) for p in trajectory)
        max_speed = max(p.get("sog", 12.0) for p in trajectory)
        speed_variance = max_speed - min_speed

        max_course_turn = max(p.get("course_delta_deg", 0.0) for p in trajectory)
        max_time_gap_min = max(p.get("dt_minutes", 0.0) for p in trajectory)

        anomaly_flags = []
        anomaly_score = 0.0

        # Check for speed drop in middle of transit
        if min_speed < 4.5 and max_speed > 9.0:
            anomaly_flags.append({
                "type": "SPEED_DROP",
                "severity": "HIGH",
                "detail": f"Speed dropped from {max_speed:.1f} kts to {min_speed:.1f} kts (loitering/slow steaming pattern typical of discharge operations)."
            })
            anomaly_score += 45.0

        # Check for sharp turning maneuver
        if max_course_turn > 45.0:
            anomaly_flags.append({
                "type": "COURSE_DEVIATION",
                "severity": "MEDIUM",
                "detail": f"Sudden course change of {max_course_turn:.1f}° recorded outside designated channel waypoints."
            })
            anomaly_score += 25.0

        # Check for AIS blackout / transmission gap
        if max_time_gap_min > 90.0:
            anomaly_flags.append({
                "type": "AIS_GAP",
                "severity": "HIGH",
                "detail": f"AIS transponder silence for {max_time_gap_min:.0f} minutes detected during transit."
            })
            anomaly_score += 30.0

        # Loitering indicator
        total_time_hours = sum(p.get("dt_minutes", 0) for p in trajectory) / 60.0
        total_dist_km = sum(p.get("segment_dist_km", 0) for p in trajectory)
        net_dist_km = haversine_distance_km(
            trajectory[0]["lat"], trajectory[0]["lon"],
            trajectory[-1]["lat"], trajectory[-1]["lon"]
        )
        if total_dist_km > 0 and (net_dist_km / total_dist_km) < 0.65 and total_time_hours > 3.0:
            anomaly_flags.append({
                "type": "LOITERING_PATTERN",
                "severity": "HIGH",
                "detail": f"Tortuous path detected (Efficiency ratio {net_dist_km/total_dist_km:.2f}), indicative of zig-zag drifting."
            })
            anomaly_score += 25.0

        normalized_score = min(100.0, anomaly_score)
        return {
            "has_anomalies": len(anomaly_flags) > 0,
            "anomaly_score": round(normalized_score, 1),
            "anomaly_flags": anomaly_flags,
            "min_speed_knots": round(min_speed, 1),
            "max_speed_knots": round(max_speed, 1),
            "max_turn_deg": round(max_course_turn, 1),
            "max_gap_min": round(max_time_gap_min, 1)
        }

    def spatio_temporal_filter(
        self,
        candidate_vessels: List[Dict[str, Any]],
        origin_lat: float,
        origin_lon: float,
        origin_radius_km: float,
        origin_time_iso: str,
        time_window_hours: float = 4.0
    ) -> List[Dict[str, Any]]:
        """
        Evaluates candidate vessels against estimated origin space-time window.
        Returns candidate vessels with closest approach distance and time delta.
        """
        filtered = []
        origin_dt = datetime.fromisoformat(origin_time_iso.replace("Z", "+00:00"))

        for v in candidate_vessels:
            pings = v.get("trajectory", [])
            if not pings:
                continue

            # Find point of closest approach (PCA)
            min_dist = float("inf")
            pca_ping = None
            closest_time_diff_hours = float("inf")

            for ping in pings:
                d = haversine_distance_km(ping["lat"], ping["lon"], origin_lat, origin_lon)
                if d < min_dist:
                    min_dist = d
                    pca_ping = ping
                    p_dt = datetime.fromisoformat(ping["timestamp"].replace("Z", "+00:00"))
                    closest_time_diff_hours = abs((p_dt - origin_dt).total_seconds()) / 3600.0

            # Mark if vessel entered the origin corridor
            is_in_corridor = min_dist <= (origin_radius_km * 2.5) and closest_time_diff_hours <= (time_window_hours * 1.8)

            v_copy = dict(v)
            v_copy["pca"] = {
                "distance_km": round(min_dist, 2),
                "closest_ping": pca_ping,
                "time_delta_hours": round(closest_time_diff_hours, 2),
                "in_corridor": is_in_corridor
            }
            filtered.append(v_copy)

        return filtered
