"""
Oil Spill Source Attribution System - SAR Detection & Characterization Engine
Stage 1: Dark spot segmentation & speckle filtering
Stage 2: Spill geometry & morphological characterization
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple
from PIL import Image, ImageDraw, ImageFilter
import io
import base64

def generate_synthetic_sar_image(
    width: int = 400,
    height: int = 400,
    slick_center: Tuple[int, int] = (200, 200),
    slick_axes: Tuple[int, int] = (60, 25),
    slick_angle: float = 35.0,
    noise_level: float = 0.18,
    feather: int = 5
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates synthetic Sentinel-1 SAR VV/VH polarization texture with an oil slick.
    Oil slicks dampen capillary waves, appearing as dark, low-backscatter patches against rough ocean clutter.
    Returns: (raw_sar_array uint8, ground_truth_mask uint8)
    """
    np.random.seed(42)
    # Background ocean radar clutter (Rayleigh / Gamma speckle distribution)
    speckle = np.random.gamma(shape=4.0, scale=35.0, size=(height, width))
    ocean_backscatter = np.clip(speckle, 60, 240).astype(np.uint8)

    # Create mask image for slick
    mask_img = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask_img)

    # Draw main ellipse
    cx, cy = slick_center
    a, b = slick_axes
    rad = math.radians(slick_angle)

    # Generate polygon vertices for an irregular organic oil slick
    num_pts = 36
    poly_pts = []
    for i in range(num_pts):
        theta = 2 * math.pi * i / num_pts
        # Base ellipse
        x_e = a * math.cos(theta)
        y_e = b * math.sin(theta)
        # Organic perturbation
        noise_mod = 1.0 + 0.15 * math.sin(3 * theta) + 0.10 * math.cos(5 * theta)
        x_e *= noise_mod
        y_e *= noise_mod
        
        # Rotate
        xr = cx + x_e * math.cos(rad) - y_e * math.sin(rad)
        yr = cy + x_e * math.sin(rad) + y_e * math.cos(rad)
        poly_pts.append((xr, yr))

    draw.polygon(poly_pts, fill=255)
    
    # Secondary tail/streamer
    tail_len = a * 0.9
    for i in range(16):
        t = i / 15.0
        tx = cx - tail_len * (0.8 + 0.6 * t) * math.cos(rad) + 8 * math.sin(t * 4)
        ty = cy - tail_len * (0.8 + 0.6 * t) * math.sin(rad) + 8 * math.cos(t * 4)
        r = max(2, int(b * 0.4 * (1.0 - t * 0.6)))
        draw.ellipse([tx - r, ty - r, tx + r, ty + r], fill=255)

    # Blur the mask slightly for realistic radar transition boundary
    mask_blurred = mask_img.filter(ImageFilter.GaussianBlur(radius=feather))
    mask_arr = np.array(mask_blurred, dtype=np.float32) / 255.0

    # Dampen radar backscatter inside slick (oil dampens Bragg scattering by 6-12 dB)
    slick_attenuation = 0.22 + 0.08 * np.random.uniform(0.8, 1.2, size=(height, width))
    raw_sar = ocean_backscatter * (1.0 - mask_arr * (1.0 - slick_attenuation))
    
    # Add subtle sensor noise lines / banding typical in SAR Swaths
    bands = (np.sin(np.linspace(0, 10 * math.pi, height))[:, None] * 6).astype(np.float32)
    raw_sar = np.clip(raw_sar + bands, 10, 255).astype(np.uint8)

    binary_mask = (mask_arr > 0.45).astype(np.uint8) * 255
    return raw_sar, binary_mask

def segment_sar_slick(
    raw_image_bytes: bytes = None,
    raw_array: np.ndarray = None,
    threshold_value: int = 85,
    speckle_filter_size: int = 3
) -> Dict[str, Any]:
    """
    Performs segmentation on Sentinel-1 SAR imagery to isolate oil slick anomalies
    and extracts geometric characteristics.
    """
    if raw_array is None:
        if raw_image_bytes is not None:
            pil_img = Image.open(io.BytesIO(raw_image_bytes)).convert("L")
            raw_array = np.array(pil_img)
        else:
            raw_array, _ = generate_synthetic_sar_image()

    h, w = raw_array.shape

    # 1. Speckle Filtering (Simulated 2D Lee / Box filter)
    pil_for_filter = Image.fromarray(raw_array)
    filtered = pil_for_filter.filter(ImageFilter.MedianFilter(size=speckle_filter_size))
    filtered_arr = np.array(filtered, dtype=np.float32)

    # 2. Adaptive / Global Thresholding for dark radar anomalies
    dark_mask = (filtered_arr < threshold_value).astype(np.uint8)

    # 3. Morphological cleanup (Opening then Closing)
    mask_pil = Image.fromarray(dark_mask * 255)
    mask_clean = mask_pil.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5))
    clean_arr = np.array(mask_clean) > 128

    # Extract pixel coordinates of slick
    y_coords, x_coords = np.where(clean_arr)
    
    if len(x_coords) < 20:
        # Fallback if threshold is too strict: use Otsu-like fallback
        mean_val = np.mean(filtered_arr)
        clean_arr = filtered_arr < (mean_val - 1.2 * np.std(filtered_arr))
        y_coords, x_coords = np.where(clean_arr)

    if len(x_coords) == 0:
        return {
            "success": False,
            "message": "No dark spot slick detected with current radar threshold."
        }

    # Centroid in pixel coordinates
    cx = float(np.mean(x_coords))
    cy = float(np.mean(y_coords))

    # Moments & Principal Axis Orientation
    cov = np.cov(x_coords, y_coords)
    eigenvalues, eigenvectors = np.linalg.eigh(cov)
    
    # Sort eigenvalues
    order = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[order]
    eigenvectors = eigenvectors[:, order]

    # Major & Minor semi-axes in pixels (2 * std dev)
    major_axis_px = float(2.0 * math.sqrt(max(1.0, eigenvalues[0])))
    minor_axis_px = float(2.0 * math.sqrt(max(1.0, eigenvalues[1])))
    
    # Orientation angle in degrees (clockwise from North/up)
    angle_rad = math.atan2(eigenvectors[1, 0], eigenvectors[0, 0])
    angle_deg = (math.degrees(angle_rad) + 360) % 360

    # Total pixel count
    pixel_count = int(np.sum(clean_arr))

    # Convert binary mask and raw image to Base64 PNGs for UI display
    def array_to_base64_png(arr: np.ndarray) -> str:
        img = Image.fromarray(arr.astype(np.uint8))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"

    # Create overlay visualization (Radar + Glowing Cyan/Red Slick Boundary)
    rgb_overlay = np.stack([raw_array, raw_array, raw_array], axis=-1)
    rgb_overlay[clean_arr, 0] = np.clip(rgb_overlay[clean_arr, 0] * 0.3 + 220, 0, 255).astype(np.uint8)
    rgb_overlay[clean_arr, 1] = np.clip(rgb_overlay[clean_arr, 1] * 0.3 + 40, 0, 255).astype(np.uint8)
    rgb_overlay[clean_arr, 2] = np.clip(rgb_overlay[clean_arr, 2] * 0.3 + 60, 0, 255).astype(np.uint8)

    return {
        "success": True,
        "pixel_centroid": {"x": round(cx, 1), "y": round(cy, 1)},
        "pixel_count": pixel_count,
        "major_axis_px": round(major_axis_px, 1),
        "minor_axis_px": round(minor_axis_px, 1),
        "aspect_ratio": round(major_axis_px / max(1.0, minor_axis_px), 2),
        "orientation_deg": round(angle_deg, 1),
        "raw_sar_base64": array_to_base64_png(raw_array),
        "mask_base64": array_to_base64_png((clean_arr * 255).astype(np.uint8)),
        "overlay_base64": array_to_base64_png(rgb_overlay),
        "width": w,
        "height": h
    }

def calculate_geospatial_geometry(
    sar_meta: Dict[str, Any],
    center_lat: float,
    center_lon: float,
    pixel_resolution_meters: float = 20.0
) -> Dict[str, Any]:
    """
    Converts SAR pixel features into real-world SI metric units (km², km, geographic polygon coordinates).
    """
    px_area_m2 = pixel_resolution_meters * pixel_resolution_meters
    area_m2 = sar_meta["pixel_count"] * px_area_m2
    area_km2 = area_m2 / 1e6

    major_axis_km = (sar_meta["major_axis_px"] * pixel_resolution_meters) / 1000.0
    minor_axis_km = (sar_meta["minor_axis_px"] * pixel_resolution_meters) / 1000.0
    
    # Ramanujan approximation for ellipse perimeter
    a = major_axis_km / 2.0
    b = minor_axis_km / 2.0
    h_param = ((a - b) ** 2) / ((a + b) ** 2) if (a + b) > 0 else 0
    perimeter_km = math.pi * (a + b) * (1 + (3 * h_param) / (10 + math.sqrt(4 - 3 * h_param)))

    # Estimate slick thickness and volume (ITOPF standard for dark radar slicks: ~1 to 5 microns)
    # Average thickness = 2.5 microns (2.5e-6 meters) -> Volume = Area * Thickness
    volume_m3 = area_m2 * 2.5e-6
    volume_barrels = volume_m3 * 6.2898  # 1 m3 = ~6.2898 bbls
    volume_tonnes = volume_m3 * 0.86     # average crude oil density ~0.86 t/m3

    # Generate GeoJSON coordinates for slick contour boundary
    km_per_lat = 111.139
    km_per_lon = 111.139 * math.cos(math.radians(center_lat))
    
    orientation_rad = math.radians(sar_meta["orientation_deg"])
    num_vertices = 32
    polygon_coords = []
    
    for i in range(num_vertices):
        theta = 2 * math.pi * i / num_vertices
        x_km = a * math.cos(theta)
        y_km = b * math.sin(theta)
        # Organic edge noise
        perturb = 1.0 + 0.12 * math.sin(3 * theta) + 0.08 * math.cos(5 * theta)
        x_km *= perturb
        y_km *= perturb

        # Rotate by orientation
        xr = x_km * math.cos(orientation_rad) - y_km * math.sin(orientation_rad)
        yr = x_km * math.sin(orientation_rad) + y_km * math.cos(orientation_rad)

        pt_lat = center_lat + (yr / km_per_lat)
        pt_lon = center_lon + (xr / km_per_lon)
        polygon_coords.append([round(pt_lat, 6), round(pt_lon, 6)])

    # Close polygon
    polygon_coords.append(polygon_coords[0])

    return {
        "centroid": {"lat": round(center_lat, 6), "lon": round(center_lon, 6)},
        "area_km2": round(area_km2, 2),
        "perimeter_km": round(perimeter_km, 2),
        "length_km": round(major_axis_km, 2),
        "width_km": round(minor_axis_km, 2),
        "aspect_ratio": round(sar_meta["aspect_ratio"], 2),
        "orientation_deg": sar_meta["orientation_deg"],
        "estimated_volume_m3": round(volume_m3, 1),
        "estimated_volume_bbl": round(volume_barrels, 1),
        "estimated_volume_tonnes": round(volume_tonnes, 1),
        "polygon_coordinates": polygon_coords
    }
