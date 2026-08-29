"""
Oil Spill Source Attribution System - 5-Factor Suspect Attribution Scoring Engine
Stage 5: Multi-Factor Weighted Scoring & Attribution Leaderboard

Formulation:
  Suspect Score = 0.35 * S_prox + 0.25 * S_time + 0.20 * S_traj + 0.10 * S_speed + 0.10 * S_behav

  All sub-scores are normalized between 0.0 and 100.0.
  Final Score is presented as Attribution Probability / Suspicion Confidence Index.
"""

import math
from typing import Dict, Any, List

class ScoringEngine:
    WEIGHT_PROXIMITY = 0.35
    WEIGHT_TIME = 0.25
    WEIGHT_TRAJECTORY = 0.20
    WEIGHT_SPEED_ANOMALY = 0.10
    WEIGHT_BEHAVIORAL_ANOMALY = 0.10

    def __init__(self):
        pass

    def compute_proximity_score(self, distance_km: float, origin_sigma_km: float = 4.0) -> float:
        """
        Computes spatial proximity score using Gaussian decay.
        100% at 0 km distance, drops smoothly with spatial distance.
        """
        sigma = max(1.0, origin_sigma_km)
        score = 100.0 * math.exp(- (distance_km ** 2) / (2.0 * (sigma ** 2)))
        return max(0.0, min(100.0, score))

    def compute_time_correlation_score(self, time_delta_hours: float, time_sigma_hours: float = 2.5) -> float:
        """
        Computes temporal coincidence score using Gaussian decay.
        100% when vessel was at origin precisely at estimated release time.
        """
        tau = max(0.5, time_sigma_hours)
        score = 100.0 * math.exp(- (time_delta_hours ** 2) / (2.0 * (tau ** 2)))
        return max(0.0, min(100.0, score))

    def compute_trajectory_correlation_score(
        self,
        vessel_course_deg: float,
        slick_orientation_deg: float,
        drift_heading_deg: float
    ) -> float:
        """
        Computes alignment between vessel's track and slick elongation axis / drift vector.
        Ships traveling collinear with the slick shape or counter to drift have higher physical correlation.
        """
        # Direction alignment (mod 180 since slick axis is bidirectional)
        diff_orientation = abs((vessel_course_deg - slick_orientation_deg + 180) % 180 - 90)
        align_orientation = (diff_orientation / 90.0) * 100.0

        # Correlation with advection vector
        diff_drift = abs((vessel_course_deg - drift_heading_deg + 180) % 360 - 180)
        align_drift = (1.0 - (diff_drift / 180.0)) * 100.0

        # Weighted combination of orientation and heading alignment
        score = 0.6 * align_orientation + 0.4 * align_drift
        return max(0.0, min(100.0, score))

    def compute_speed_anomaly_score(
        self,
        sog_at_pca: float,
        normal_cruise_speed: float = 14.0,
        min_sog_in_vicinity: float = 12.0
    ) -> float:
        """
        Scores speed deviations. Slower steaming in open ocean (2-5 kts) during transit is a primary
        indicator of illegal tank washing / oily bilge discharge.
        """
        if min_sog_in_vicinity < 4.0:
            # Drastic slowdown to discharge speed
            return 95.0
        elif min_sog_in_vicinity < 7.0:
            return 75.0
        elif min_sog_in_vicinity < 10.0 and normal_cruise_speed >= 13.0:
            return 50.0
        else:
            # Steady cruising speed, low anomaly
            return 15.0

    def compute_behavioral_anomaly_score(
        self,
        anomaly_meta: Dict[str, Any],
        is_night_transit: bool = True
    ) -> float:
        """
        Scores behavioral anomalies (sharp turns, loitering, AIS gap blackout, night-time dumping).
        """
        base_score = anomaly_meta.get("anomaly_score", 0.0)
        
        # Night discharge bonus: 70%+ of illegal discharges happen between 22:00 and 04:00 local time
        if is_night_transit and base_score > 20.0:
            base_score = min(100.0, base_score + 15.0)

        return max(0.0, min(100.0, base_score))

    def evaluate_vessel(
        self,
        vessel: Dict[str, Any],
        origin_meta: Dict[str, Any],
        slick_meta: Dict[str, Any],
        drift_meta: Dict[str, Any],
        anomaly_meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Computes 5-factor breakdown and composite Suspect Score for a candidate vessel.
        """
        pca = vessel.get("pca", {})
        distance_km = pca.get("distance_km", 25.0)
        time_delta_hours = pca.get("time_delta_hours", 6.0)

        origin_sigma_km = origin_meta.get("uncertainty_radius_km", 4.0)
        
        # Sub-scores
        s_prox = self.compute_proximity_score(distance_km, origin_sigma_km)
        s_time = self.compute_time_correlation_score(time_delta_hours)
        
        pca_ping = pca.get("closest_ping") or {}
        vessel_course = pca_ping.get("cog", 0.0)
        slick_orient = slick_meta.get("orientation_deg", 0.0)
        drift_heading = drift_meta.get("net_advection_heading_deg", 0.0)
        s_traj = self.compute_trajectory_correlation_score(vessel_course, slick_orient, drift_heading)

        sog_pca = pca_ping.get("sog", 12.0)
        min_sog = anomaly_meta.get("min_speed_knots", sog_pca)
        s_speed = self.compute_speed_anomaly_score(sog_pca, 14.0, min_sog)

        # Check if PCA was at night
        s_behav = self.compute_behavioral_anomaly_score(anomaly_meta, is_night_transit=True)

        # 5-Factor Weighted Composite
        composite_score = (
            self.WEIGHT_PROXIMITY * s_prox +
            self.WEIGHT_TIME * s_time +
            self.WEIGHT_TRAJECTORY * s_traj +
            self.WEIGHT_SPEED_ANOMALY * s_speed +
            self.WEIGHT_BEHAVIORAL_ANOMALY * s_behav
        )

        # Categorize confidence level
        if composite_score >= 70.0:
            status = "PRIMARY SUSPECT"
            risk_tier = "HIGH"
            badge_color = "red"
        elif composite_score >= 40.0:
            status = "PERSON OF INTEREST"
            risk_tier = "MEDIUM"
            badge_color = "amber"
        elif composite_score >= 20.0:
            status = "LOW PROBABILITY"
            risk_tier = "LOW"
            badge_color = "blue"
        else:
            status = "EXCLUDED"
            risk_tier = "NEGLIGIBLE"
            badge_color = "slate"

        return {
            "mmsi": vessel.get("mmsi"),
            "vessel_name": vessel.get("vessel_name", "UNKNOWN VESSEL"),
            "vessel_type": vessel.get("vessel_type", "Tanker"),
            "imo": vessel.get("imo", "N/A"),
            "flag": vessel.get("flag", "Panama"),
            "callsign": vessel.get("callsign", "9V291"),
            "suspect_score": round(composite_score, 1),
            "status": status,
            "risk_tier": risk_tier,
            "badge_color": badge_color,
            "factors": {
                "proximity": {
                    "weight": 0.35,
                    "score": round(s_prox, 1),
                    "value_km": distance_km,
                    "weighted_contrib": round(self.WEIGHT_PROXIMITY * s_prox, 1)
                },
                "time_correlation": {
                    "weight": 0.25,
                    "score": round(s_time, 1),
                    "value_hours_delta": time_delta_hours,
                    "weighted_contrib": round(self.WEIGHT_TIME * s_time, 1)
                },
                "trajectory_alignment": {
                    "weight": 0.20,
                    "score": round(s_traj, 1),
                    "vessel_course_deg": round(vessel_course, 1),
                    "weighted_contrib": round(self.WEIGHT_TRAJECTORY * s_traj, 1)
                },
                "speed_anomaly": {
                    "weight": 0.10,
                    "score": round(s_speed, 1),
                    "sog_knots": sog_pca,
                    "weighted_contrib": round(self.WEIGHT_SPEED_ANOMALY * s_speed, 1)
                },
                "behavioral_anomaly": {
                    "weight": 0.10,
                    "score": round(s_behav, 1),
                    "flags": anomaly_meta.get("anomaly_flags", []),
                    "weighted_contrib": round(self.WEIGHT_BEHAVIORAL_ANOMALY * s_behav, 1)
                }
            },
            "closest_approach": pca,
            "trajectory": vessel.get("trajectory", [])
        }

    def rank_leaderboard(self, evaluated_vessels: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sorts candidates by suspect score descending and computes normalized attribution probability.
        """
        ranked = sorted(evaluated_vessels, key=lambda v: v["suspect_score"], reverse=True)
        
        # Softmax / normalized attribution probability across top candidates
        scores = [v["suspect_score"] for v in ranked]
        total_score = sum(scores)

        for i, v in enumerate(ranked):
            v["rank"] = i + 1
            if total_score > 0:
                attribution_prob = (v["suspect_score"] / total_score) * 100.0
            else:
                attribution_prob = 100.0 / len(ranked) if ranked else 0.0
            v["attribution_probability_pct"] = round(attribution_prob, 1)

        return ranked
