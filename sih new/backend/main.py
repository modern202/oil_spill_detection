from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
import os

app = FastAPI(
    title="PS143 Oil Spill Attribution API",
    version="2.0.0",
    description="Automated Satellite-AIS Source Attribution Engine"
)

# Enable CORS for the Bun/React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root directory resolution (handles running from either 'sih new' or 'backend')
BASE_DIR = Path(__file__).resolve().parent.parent

@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "PS143 AEGIS-SAR Attribution Engine",
        "docs_url": "/docs"
    }

@app.get("/api/v1/cases/{case_id}/summary")
def get_case_summary(case_id: str):
    """Returns top suspect attribution scores, radar slick metrics, and evidence log."""
    # Check both root outputs/ and backend/outputs/
    report_path = BASE_DIR / "outputs" / case_id / "final_attribution_report.json"
    
    if not report_path.exists():
        fallback_path = Path(f"outputs/{case_id}/final_attribution_report.json")
        if fallback_path.exists():
            report_path = fallback_path
        else:
            raise HTTPException(
                status_code=404, 
                detail=f"Case report not found at {report_path}"
            )
            
    with open(report_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/v1/cases/{case_id}/geometries")
def get_all_geometries(case_id: str):
    """Returns GeoJSON spatial layers: Spill polygon, Reverse drift origin hull, and Filtered AIS trajectories."""
    case_folder = BASE_DIR / "outputs" / case_id
    if not case_folder.exists():
        case_folder = Path(f"outputs/{case_id}")

    files = {
        "spill_slick": case_folder / "spill_geometry.geojson",
        "origin_zone": case_folder / "probable_origin_zone.geojson",
        "candidate_tracks": case_folder / "candidate_trajectories.geojson"
    }
    
    response = {}
    for key, path in files.items():
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                response[key] = json.load(f)
        else:
            response[key] = None
            
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)