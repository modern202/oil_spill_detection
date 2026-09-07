# 🛰️ AEGIS-SAR — Oil Spill Source Attribution Engine

**PS143** · Automated Satellite–AIS Fusion for Marine Pollution Source Attribution

AEGIS-SAR turns a raw SAR (Synthetic Aperture Radar) satellite scene of an oil slick into a courtroom-ready forensic case file — automatically detecting the spill, hindcasting where it drifted from, cross-referencing historical vessel traffic, and ranking the most probable polluter with a defensible confidence score.

Built for Smart India Hackathon — Problem Statement 143.

---

## The Problem

When an oil spill is spotted at sea, investigators are left asking one question with almost no tooling to answer it: **whose ship did this?** Satellite imagery shows *where* the slick is now, not *who* caused it or *when*. Piecing together radar imagery, ocean currents, wind data, and AIS vessel logs by hand is slow, manual, and rarely holds up as evidence.

AEGIS-SAR automates the entire investigative pipeline, end to end, in minutes.

## How It Works

```
[ Stage 1: SAR Detection ]      ──> Sentinel-1 IW GRD C-Band Radar Segmentation
│
[ Stage 2: Slick Morphology ]   ──> Perimeter, Centroid & Area (km²) Extraction
│
[ Stage 3: Drift Simulation ]   ──> Hydrodynamic Lagrangian Hindcast (-24h) & Forecast (+24h)
│
[ Stage 4: AIS Spatiotemporal ] ──> Candidate vessel filtering & SOG loiter anomaly detection
│
[ Stage 5: Multi-Factor Match ] ──> Weighted Scoring (Spatial, Time, Trajectory, Speed, Risk)
```

1. **Detect** the slick from raw SAR backscatter and extract its geometry.
2. **Hindcast** the spill backward through a physics-based drift model (ocean current advection + wind-driven leeway) to estimate its probable origin zone.
3. **Cross-reference** that origin zone and time window against historical AIS vessel tracks to shortlist candidate ships.
4. **Score** every candidate on five weighted factors and rank them into a suspect leaderboard.
5. **Generate** an exportable forensic dossier with chain-of-custody hashes for legal/regulatory handoff.

## ✨ Key Features

- **3D Photorealistic Earth Globe** (Three.js) — a rotating navy-toned globe with a live pulsing beacon marking the incident location.
- **Tactical Ocean GIS Viewport** (Leaflet + Esri Satellite) — a time-lapse scrubber (`-24h → NOW → +24h`) that replays the slick's drift trajectory over satellite basemaps.
- **Radar Studio** — an interactive SAR backscatter viewer with adjustable detection thresholds for tuning slick segmentation.
- **5-Factor Attribution Leaderboard** — automated suspect ranking with Closest Point of Approach (CPA), loiter duration, and an animated speed-over-ground (SOG) kinematic profile.
- **Institutional & Social Impact Suite:**
  - **Impact & Relief** — ecological reserve vulnerability, fisherfolk disruption stats, and a containment mobilization budget calculator.
  - **Operator Compliance Portal** — instant MMSI lookup with compliance status verification.
  - **Citizen Sightings** — a ground-truth validation feed for field observation reports.
  - **Official Legal Dossier** — an exportable forensic certificate with cryptographic chain-of-custody hashes and a full factor-by-factor score breakdown.

## Attribution Scoring Model

Each candidate vessel is scored across five weighted factors and combined into a single suspicion confidence index:

| Factor | Weight | Signal |
|---|---|---|
| Spatial Proximity | 35% | Closest Point of Approach to the hindcast origin zone |
| Temporal Alignment | 25% | Vessel presence during the estimated spill window |
| Trajectory Match | 20% | Vessel heading vs. reconstructed drift path |
| Speed Profile | 10% | Anomalous slowdowns / loitering behavior |
| Risk Behavior | 10% | Historical compliance & operator risk indicators |

## 🛠️ Tech Stack

**Backend** — Python 3.10+, FastAPI, Uvicorn, GeoPandas, Shapely, NumPy, SciPy, Scikit-Learn, XGBoost
**Frontend** — React 19, Vite, Bun, Tailwind CSS, Lucide React
**Mapping & 3D** — Three.js (WebGL), React-Leaflet, Esri World Imagery, CartoDB Dark Matter, Recharts

## 📂 Project Structure

```
sih new/
├── backend/
│   ├── main.py                       # FastAPI REST server — CORS & GeoJSON endpoints
│   ├── scenarios.py                  # Preset case scenarios
│   └── modules/
│       ├── detector.py               # Stage 1–2: SAR dark-spot detection & slick morphology
│       ├── drift_engine.py           # Stage 3: hydrodynamic advection & dispersion (hindcast/forecast)
│       ├── ais_engine.py             # Stage 4: AIS trajectory reconstruction & anomaly detection
│       ├── scoring_engine.py         # Stage 5: 5-factor weighted attribution scoring
│       ├── impact_engine.py          # Ecological/social impact & cleanup cost estimation
│       └── report_generator.py       # Forensic dossier generation (chain-of-custody hashes)
├── data/
│   ├── sar_scenes/                   # Raw Sentinel-1 SAR imagery
│   ├── ais/                          # Historical regional AIS vessel logs
│   └── incidents/                    # Incident metadata per case
├── outputs/
│   └── CASE_001/
│       ├── final_attribution_report.json    # Generated suspect scores & metrics
│       ├── spill_geometry.geojson           # Detected slick boundary polygon
│       ├── probable_origin_zone.geojson     # Hindcast origin convex hull
│       └── candidate_trajectories.geojson   # Reconstructed candidate vessel tracks
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Globe3D.jsx           # 3D Earth globe with incident flare
│       │   ├── TacticalMap.jsx       # Satellite GIS with drift time-lapse
│       │   ├── RadarStudio.jsx       # SAR backscatter radar viewer
│       │   ├── SuspectLeaderboard.jsx
│       │   ├── ImpactModal.jsx
│       │   ├── CompliancePortal.jsx
│       │   └── EvidenceDossierModal.jsx
│       └── App.jsx                   # Command center layout
├── requirements.txt
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Bun** (recommended) or **Node.js 18+**

### 1. Backend

```bash
cd "sih new"

# create & activate a virtual environment
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# install dependencies
pip install -r requirements.txt

# start the API
python -m uvicorn backend.main:app --reload
```

- API health check: `http://localhost:8000/`
- Interactive API docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend

```bash
cd "sih new/frontend"

bun install
# or: npm install

bun run dev
# or: npm run dev
```

Open **`http://localhost:5173`** in your browser.

## 📡 API Overview

| Endpoint | Description |
|---|---|
| `GET /` | Health check |
| `GET /api/v1/cases/{case_id}/summary` | Suspect attribution scores, slick metrics, and evidence log |
| `GET /api/v1/cases/{case_id}/geometries` | GeoJSON layers — spill polygon, origin hull, candidate AIS tracks |

Full interactive documentation is available at `/docs` once the backend is running.

## Sample Case

A demo case (`CASE_001`) ships with the repo, including a synthetic SAR scene, regional AIS log, and a pre-generated attribution report — spin up the backend and frontend and it loads out of the box.

## License

Add your license of choice here (e.g. MIT).
