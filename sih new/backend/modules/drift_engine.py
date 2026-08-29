"""
Oil Spill Source Attribution System - Hydrodynamic Advection & Dispersion Drift Engine
Stage 3: Drift Simulation (Hindcasting backward in time + Forward containment forecasting)

Physics Model:
  v_spill = v_current + alpha * v_wind  (with wind deflection angle ~ 10-15 deg to the right in NH)
  alpha: Windage / leeway coefficient ~ 0.03 (3.0%)
  Backward advection: dr/dt = - v_spill(r, t)
  Dispersion: horizontal diffusion uncertainty sigma(t) = sqrt(2 * Kd * t)
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple

class DriftEngine:
    def __init__(
        self,
        leeway_factor: float = 0.030,     # 3.0% windage factor
        wind_deflection_deg: float = 12.0, # Coriolis wind deflection angle in Northern Hemisphere
        horizontal_diffusivity: float = 15.0 # m^2/s horizontal diffusion
    ):
        self.leeway_factor = leeway_factor
        self.wind_deflection_deg = wind_deflection_deg
        self.Kd = horizontal_diffusivity

    def calculate_total_velocity(
        self,
        current_u: float,  # m/s Eastward ocean current
        current_v: float,  # m/s Northward ocean current
        wind_speed_ms: float, # m/s 10m wind speed
        wind_dir_deg: float   # degrees direction wind is blowing FROM (meteorological)
    ) -> Tuple[float, float]:
        """
        Computes composite surface drift velocity (u, v in m/s).
        Wind direction is converted to 'blowing towards' vector + deflection.
        """
        # Wind blowing TOWARDS direction = (wind_dir + 180) % 360
        wind_towards_deg = (wind_dir_deg + 180.0) % 360.0
        # Apply Coriolis deflection (+12 deg to right in Northern Hemisphere)
        drift_wind_dir_rad = math.radians((wind_towards_deg + self.wind_deflection_deg) % 360.0)

        # Wind drift component
        wind_u = self.leeway_factor * wind_speed_ms * math.sin(drift_wind_dir_rad)
        wind_v = self.leeway_factor * wind_speed_ms * math.cos(drift_wind_dir_rad)

        total_u = current_u + wind_u
        total_v = current_v + wind_v
        return total_u, total_v

    def run_hindcast(
        self,
        obs_lat: float,
        obs_lon: float,
        obs_time_iso: str,
        current_u: float,
        current_v: float,
        wind_speed_ms: float,
        wind_dir_deg: float,
        hindcast_hours: float = 12.0,
        time_step_hours: float = 1.0,
        initial_radius_km: float = 1.5
    ) -> Dict[str, Any]:
        """
        Simulates backward advection from observation point T_obs to T - 12 hours.
        Produces trajectory waypoints, uncertainty dispersion ellipses, and origin zones.
        """
        # Velocity in m/s
        u_ms, v_ms = self.calculate_total_velocity(current_u, current_v, wind_speed_ms, wind_dir_deg)
        speed_knots = math.hypot(u_ms, v_ms) * 1.94384
        drift_heading_deg = (math.degrees(math.atan2(u_ms, v_ms)) + 360.0) % 360.0

        # Conversions: 1 deg lat = 111.139 km, 1 deg lon = 111.139 * cos(lat) km
        km_per_lat = 111.139
        km_per_lon = 111.139 * math.cos(math.radians(obs_lat))

        # Backward velocity in km/h (negative since we trace backwards)
        u_kmh = u_ms * 3.6
        v_kmh = v_ms * 3.6

        waypoints = []
        confidence_zones = []

        current_lat = obs_lat
        current_lon = obs_lon

        num_steps = int(hindcast_hours / time_step_hours)

        for step in range(num_steps + 1):
            t_back_hours = step * time_step_hours
            
            # Position at T - t_back
            # Backward: pos(t) = obs_pos - v * t_back
            lat_step = obs_lat - (v_kmh * t_back_hours) / km_per_lat
            lon_step = obs_lon - (u_kmh * t_back_hours) / km_per_lon

            # Spatial dispersion radius growth: sigma(t) = sqrt(r0^2 + 2 * Kd * t)
            t_sec = t_back_hours * 3600.0
            diffusion_radius_m = math.sqrt((initial_radius_km * 1000.0)**2 + 2.0 * self.Kd * t_sec)
            dispersion_radius_km = diffusion_radius_m / 1000.0
            
            # Semi-major axis aligned with advection direction (elongated by shear), semi-minor axis perpendicular
            semi_major_km = dispersion_radius_km * (1.0 + 0.08 * t_back_hours)
            semi_minor_km = dispersion_radius_km * (1.0 + 0.03 * t_back_hours)

            # Generate origin zone polygon vertices
            ellipse_polygon = self._generate_ellipse_polygon(
                lat_step, lon_step, semi_major_km, semi_minor_km, drift_heading_deg, km_per_lat, km_per_lon
            )

            wp = {
                "step": step,
                "hours_ago": round(t_back_hours, 1),
                "lat": round(lat_step, 6),
                "lon": round(lon_step, 6),
                "uncertainty_radius_km": round(dispersion_radius_km, 2),
                "semi_major_km": round(semi_major_km, 2),
                "semi_minor_km": round(semi_minor_km, 2),
                "confidence_interval": "95%",
                "polygon": ellipse_polygon
            }
            waypoints.append(wp)

            # Specific milestone origin zones (T-2h, T-6h, T-12h)
            if step in [int(2/time_step_hours), int(6/time_step_hours), int(12/time_step_hours)] or step == num_steps:
                confidence_zones.append({
                    "time_label": f"T-{int(t_back_hours)}h",
                    "hours_ago": t_back_hours,
                    "centroid": {"lat": round(lat_step, 6), "lon": round(lon_step, 6)},
                    "area_km2": round(math.pi * semi_major_km * semi_minor_km, 2),
                    "semi_major_km": round(semi_major_km, 2),
                    "semi_minor_km": round(semi_minor_km, 2),
                    "polygon": ellipse_polygon
                })

        # Estimated primary origin window is around T-6h to T-8h
        primary_origin = waypoints[min(len(waypoints)-1, int(6 / time_step_hours))]

        return {
            "drift_parameters": {
                "current_u_ms": current_u,
                "current_v_ms": current_v,
                "wind_speed_ms": wind_speed_ms,
                "wind_dir_deg": wind_dir_deg,
                "net_advection_speed_knots": round(speed_knots, 2),
                "net_advection_heading_deg": round(drift_heading_deg, 1),
                "leeway_factor_pct": self.leeway_factor * 100
            },
            "trajectory_waypoints": waypoints,
            "origin_zones": confidence_zones,
            "estimated_origin": {
                "lat": primary_origin["lat"],
                "lon": primary_origin["lon"],
                "time_window_hours_ago": [4.0, 8.0],
                "optimal_time_hours_ago": primary_origin["hours_ago"],
                "uncertainty_radius_km": primary_origin["uncertainty_radius_km"],
                "bounding_polygon": primary_origin["polygon"]
            }
        }

    def run_forward_forecast(
        self,
        obs_lat: float,
        obs_lon: float,
        current_u: float,
        current_v: float,
        wind_speed_ms: float,
        wind_dir_deg: float,
        forecast_hours: float = 24.0,
        time_step_hours: float = 2.0,
        initial_radius_km: float = 2.0,
        ecozone_polygons: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Simulates forward spill advection from observation point T_obs to T + 24 hours.
        Calculates projected trajectory, dispersion cone, and vulnerable zone intersection.
        """
        u_ms, v_ms = self.calculate_total_velocity(current_u, current_v, wind_speed_ms, wind_dir_deg)
        u_kmh = u_ms * 3.6
        v_kmh = v_ms * 3.6
        drift_heading_deg = (math.degrees(math.atan2(u_ms, v_ms)) + 360.0) % 360.0

        km_per_lat = 111.139
        km_per_lon = 111.139 * math.cos(math.radians(obs_lat))

        steps = int(forecast_hours / time_step_hours)
        forecast_path = []
        cone_boundary_left = []
        cone_boundary_right = []

        for step in range(steps + 1):
            t_fwd_hours = step * time_step_hours
            lat_step = obs_lat + (v_kmh * t_fwd_hours) / km_per_lat
            lon_step = obs_lon + (u_kmh * t_fwd_hours) / km_per_lon

            t_sec = t_fwd_hours * 3600.0
            diffusion_radius_m = math.sqrt((initial_radius_km * 1000.0)**2 + 2.0 * self.Kd * t_sec)
            dispersion_radius_km = diffusion_radius_m / 1000.0

            # Compute lateral boundary points perpendicular to heading
            perp_heading_rad = math.radians((drift_heading_deg + 90.0) % 360.0)
            d_lat = (dispersion_radius_km * math.cos(perp_heading_rad)) / km_per_lat
            d_lon = (dispersion_radius_km * math.sin(perp_heading_rad)) / km_per_lon

            cone_boundary_right.append([round(lat_step + d_lat, 6), round(lon_step + d_lon, 6)])
            cone_boundary_left.insert(0, [round(lat_step - d_lat, 6), round(lon_step - d_lon, 6)])

            forecast_path.append({
                "hours_ahead": round(t_fwd_hours, 1),
                "lat": round(lat_step, 6),
                "lon": round(lon_step, 6),
                "dispersion_width_km": round(dispersion_radius_km * 2, 2)
            })

        # Complete envelope polygon
        dispersion_envelope = cone_boundary_right + cone_boundary_left
        if len(dispersion_envelope) > 0:
            dispersion_envelope.append(dispersion_envelope[0])

        return {
            "forecast_hours": forecast_hours,
            "forecast_path": forecast_path,
            "dispersion_envelope": dispersion_envelope,
            "projected_speed_kmh": round(math.hypot(u_kmh, v_kmh), 2)
        }

    def _generate_ellipse_polygon(
        self,
        center_lat: float,
        center_lon: float,
        a_km: float,
        b_km: float,
        heading_deg: float,
        km_per_lat: float,
        km_per_lon: float,
        num_points: int = 24
    ) -> List[List[float]]:
        """Generates a closed polygon ring for an oriented confidence ellipse."""
        rad_heading = math.radians(heading_deg)
        coords = []
        for i in range(num_points):
            theta = 2 * math.pi * i / num_points
            x = a_km * math.cos(theta)
            y = b_km * math.sin(theta)
            # Rotate
            xr = x * math.cos(rad_heading) - y * math.sin(rad_heading)
            yr = x * math.sin(rad_heading) + y * math.cos(rad_heading)
            
            p_lat = center_lat + (yr / km_per_lat)
            p_lon = center_lon + (xr / km_per_lon)
            coords.append([round(p_lat, 6), round(p_lon, 6)])
        coords.append(coords[0])
        return coords
