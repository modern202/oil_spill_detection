
## ⚡ End-to-End Pipeline Architecture


```

[ Stage 1: SAR Detection ]      ──> Sentinel-1 IW GRD C-Band Radar Segmentation
│
[ Stage 2: Slick Morphology ]    ──> Perimeter, Centroid & Area (km²) Extraction
│
[ Stage 3: Drift Simulation ]   ──> Hydrodynamic Lagrangian Hindcast (-24h) & Forecast (+24h)
│
[ Stage 4: AIS Spatiotemporal ] ──> Candidate vessel filtering & SOG loiter anomaly detection
│
[ Stage 5: Multi-Factor Match ] ──> Weighted Scoring (Spatial 25%, Time 25%, Trajectory 20%, Speed 10%, Risk 10%)

```

---

## 🌟 Key Features

* **3D Photorealistic Earth Globe (`Three.js`):** Deep navy oceanic body, illuminated city networks, continuous orbital rotation, and dynamic red pulsing laser beacon over the incident coordinates.
* **Tactical Ocean GIS Viewport (`Leaflet` + `Esri Satellite`):** Dynamic time-lapse scrubber (`-24h`, `-12h`, `NOW`, `+12h`, `+24h`) rendering live drift trajectory lines and red hazard nodes.
* **Stage 1 Radar Studio (`SAR Backscatter Ingestion`):** Interactive satellite map viewport centered on the Gulf of Mexico with dynamic threshold tuning (`30 - 120 dB-raw`).
* **5-Factor Attribution Leaderboard:** Automated suspect ranking (`GULF_EXPLORER_TANKER` @ 94.1%), Closest Point of Approach (CPA), origin loiter duration, and an animated SOG kinematic drop profile graph.
* **Institutional & Social Impact Suite:**
  - **Impact & Relief:** Ecological reserve vulnerability, fisherfolk disruption stats, and containment mobilization budget calculator.
  - **Operator Compliance Portal:** Instant 9-digit MMSI search terminal with interactive presets and compliance status verification.
  - **Citizen Sightings:** Ground-truth validation feed incorporating USCG FLIR observation cards and pilot reports.
  - **Official Legal Dossier:** Exportable forensic certificate featuring chain-of-custody cryptographic hashes and full factor breakdowns.

---

## 🛠️ Tech Stack

* **Backend Engine:** Python 3.10+, FastAPI, Uvicorn, GeoPandas, Shapely, NumPy, Scikit-Learn
* **Frontend UI:** React 18, Vite, Bun runtime, Tailwind CSS, Lucide React
* **3D & Mapping:** Three.js (WebGL), React-Leaflet, Esri World Imagery, CartoDB Dark Matter

---

## 🚀 Quick Setup & Installation Guide

### 1. Prerequisites
* **Python 3.10+**
* **Bun** (recommended) or **Node.js 18+**

---

### 2. Backend Setup & Startup

1. Open your terminal in the root directory:
   ```powershell
   cd "sih new"

```

2. Create and activate a Python virtual environment:
```powershell
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

```


3. Install backend requirements:
```bash
pip install -r requirements.txt

```


4. Start the FastAPI API server:
```powershell
python -m uvicorn backend.main:app --reload

```


* **API Health Status:** `http://localhost:8000/`
* **Swagger Interactive Docs:** `http://localhost:8000/docs`



---

### 3. Frontend Setup & Startup

1. Open a new terminal window and navigate to `frontend`:
```powershell
cd "sih new\frontend"

```


2. Install dependencies:
```bash
bun install
# or: npm install

```


3. Start the frontend development server:
```bash
bun run dev
# or: npm run dev

```


4. Open **`http://localhost:5173`** in your browser.

---

## 📂 Project Structure

```text
sih new/
├── backend/
│   ├── main.py                     # FastAPI REST server with CORS & GeoJSON endpoints
│   └── pipeline.py                 # ML attribution engine & hydrodynamic drift models
├── outputs/
│   └── CASE_001/
│       ├── final_attribution_report.json   # Generated ML output & suspect metrics
│       ├── spill_geometry.geojson          # Vector polygon boundary of detected slick
│       ├── probable_origin_zone.geojson    # Hindcast origin convex hull
│       └── candidate_trajectories.geojson  # Reconstructed historical AIS vessel tracks
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Globe3D.jsx         # Photorealistic 3D Earth sphere with incident flare
│   │   │   ├── TacticalMap.jsx     # Satellite GIS with interactive time-lapse drift nodes
│   │   │   └── RadarStudio.jsx     # Stage 1 SAR backscatter radar studio
│   │   ├── App.jsx                 # Bento Command Center & 5-tab institutional layout
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── requirements.txt                # Python backend dependencies
└── README.md                       # Master setup & handover documentation
