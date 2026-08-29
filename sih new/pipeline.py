import os, json
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, MultiPoint, LineString, shape
from shapely.ops import transform as shp_transform
import pyproj, rasterio, cv2
from rasterio.features import shapes

def run_pipeline(case_id="CASE_001"):
    with open(f"data/incidents/{case_id}.json") as f:
        meta = json.load(f)
    with rasterio.open(f"data/sar_scenes/{case_id}_S1_IW_GRD.tif") as src:
        img = src.read(1)
        transform = src.transform

    blurred = cv2.GaussianBlur(img, (9, 9), 0)
    binary_mask = (blurred < np.percentile(blurred, 12)).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    clean_mask = cv2.morphologyEx(cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel), cv2.MORPH_CLOSE, kernel)

    mask_shapes = list(shapes(clean_mask, mask=(clean_mask == 1), transform=transform))
    spill_poly = max([shape(geom) for geom, val in mask_shapes], key=lambda p: p.area)
    
    proj_utm = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32616", always_xy=True).transform
    poly_utm = shp_transform(proj_utm, spill_poly)
    area_km2 = float(poly_utm.area / 1e6)
    perimeter_km = float(poly_utm.length / 1e3)
    centroid = spill_poly.centroid

    gpd.GeoDataFrame({"case_id": [case_id], "area_km2": [area_km2], "geometry": [spill_poly]}, crs="EPSG:4326").to_file(f"outputs/{case_id}/spill_geometry.geojson", driver="GeoJSON")

    # Drift physics
    obs_time = datetime.fromisoformat(meta["date"].replace("Z", ""))
    back_hours = 24
    np.random.seed(42)
    minx, miny, maxx, maxy = spill_poly.bounds
    particles = []
    while len(particles) < 80:
        p = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))
        if spill_poly.contains(p): particles.append([p.y, p.x])
    particle_coords = np.array(particles)
    
    u_net, v_net = 0.22 + (0.03 * -3.5), 0.12 + (0.03 * 3.0)
    m_lat = 111139.0
    m_lon = 111139.0 * np.cos(np.radians(centroid.y))
    
    for _ in range(24):
        particle_coords[:, 0] -= (v_net / m_lat) * 3600 - np.random.normal(0, np.sqrt(2 * 1.5 * 3600) / m_lat, 80)
        particle_coords[:, 1] -= (u_net / m_lon) * 3600 - np.random.normal(0, np.sqrt(2 * 1.5 * 3600) / m_lon, 80)

    origin_hull = MultiPoint([Point(xy[1], xy[0]) for xy in particle_coords]).convex_hull.buffer(0.02)
    t0_time = obs_time - timedelta(hours=back_hours)

    gpd.GeoDataFrame({"case_id": [case_id], "probable_t0": [t0_time.isoformat()], "geometry": [origin_hull]}, crs="EPSG:4326").to_file(f"outputs/{case_id}/probable_origin_zone.geojson", driver="GeoJSON")

    # AIS Evaluation
    df_ais = pd.read_csv(f"data/ais/{case_id}_regional_ais.csv")
    candidates = []
    candidate_geoms = []
    
    for mmsi, group in df_ais.groupby("mmsi"):
        pts = [Point(xy) for xy in zip(group["lon"], group["lat"])]
        line = LineString(pts)
        in_origin = [origin_hull.contains(pt) for pt in pts]
        if sum(in_origin) > 0:
            inside_pts = group[in_origin]
            min_dist = min([Point(xy).distance(origin_hull.centroid) * 111.0 for xy in zip(group["lon"], group["lat"])])
            candidates.append({
                "mmsi": int(mmsi), "vessel_name": group["vessel_name"].iloc[0], "vessel_type": group["vessel_type"].iloc[0],
                "time_in_zone_hours": round(sum(in_origin) * 0.25, 2), "min_distance_km": round(min_dist, 2),
                "min_speed_knots": round(inside_pts["sog_knots"].min(), 2)
            })
            candidate_geoms.append({"mmsi": int(mmsi), "vessel_name": group["vessel_name"].iloc[0], "geometry": line})

    gpd.GeoDataFrame(candidate_geoms, crs="EPSG:4326").to_file(f"outputs/{case_id}/candidate_trajectories.geojson", driver="GeoJSON")

    # Scoring
    type_map = {"Tanker": 1.0, "Cargo": 0.5}
    ranked = []
    for c in candidates:
        s = float(np.exp(-c["min_distance_km"] / 5.0))
        t = float(min(1.0, c["time_in_zone_hours"] / 4.0))
        k = 1.0 if c["min_speed_knots"] < 3.0 else (0.75 if c["min_speed_knots"] < 6.0 else 0.10)
        v = float(type_map.get(c["vessel_type"], 0.3))
        score = round(0.35 * s + 0.25 * t + 0.25 * k + 0.15 * v, 3)
        reasons = []
        if s > 0.7: reasons.append(f"CPA {c['min_distance_km']}km from origin")
        if t > 0.7: reasons.append(f"Residency {c['time_in_zone_hours']}h")
        if k > 0.7: reasons.append(f"Loitering speed {c['min_speed_knots']}kts")
        ranked.append({
            "mmsi": c["mmsi"], "vessel_name": c["vessel_name"], "vessel_type": c["vessel_type"],
            "attribution_score": score, "confidence_level": "HIGH" if score >= 0.75 else "LOW",
            "metrics": {"spatial_score": round(s, 3), "temporal_score": round(t, 3), "kinematic_score": round(k, 3), "vessel_risk_score": round(v, 3)},
            "evidence": " | ".join(reasons)
        })
    ranked.sort(key=lambda x: x["attribution_score"], reverse=True)

    report = {
        "case_id": case_id, "incident_name": meta["incident_name"],
        "pipeline_execution_time": datetime.now(timezone.utc).isoformat(),
        "spill_analysis": {
            "observation_time": meta["date"], "estimated_release_time": t0_time.isoformat() + "Z",
            "drift_duration_hours": back_hours, "slick_centroid": {"lat": round(centroid.y, 5), "lon": round(centroid.x, 5)},
            "slick_surface_area_km2": round(area_km2, 2), "slick_perimeter_km": round(perimeter_km, 2),
            "probable_origin_centroid": {"lat": round(origin_hull.centroid.y, 5), "lon": round(origin_hull.centroid.x, 5)}
        },
        "top_attributed_vessel": ranked[0] if ranked else None,
        "all_candidate_vessels": ranked
    }
    with open(f"outputs/{case_id}/final_attribution_report.json", "w") as f:
        json.dump(report, f, indent=4)
    return report

if __name__ == "__main__":
    run_pipeline("CASE_001")
