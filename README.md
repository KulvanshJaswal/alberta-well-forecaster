# Alberta Well Forecaster

A full-stack well production forecasting tool built with FastAPI and PostgreSQL,
seeded with real Alberta Energy Regulator (AER) and Petrinex public data.
Fits Arps decline curves per well to project future production and flag
underperforming wells — the core methodology used by Calgary production
engineers and reserves analysts daily.

Built as a portfolio project targeting Calgary oil & gas internships.

**Live demo:** https://alberta-well-forecaster.vercel.app

## Tech Stack

**Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, SciPy  
**Frontend:** React, Recharts, Leaflet  
**Database:** Neon (serverless PostgreSQL)  
**Deployment:** Docker, Azure Web Apps, Vercel, GitHub Actions CI/CD  

## Features

- 661,091 real wells seeded from AER ST37 (UWIs, locations, licensee, status)
- 18 months of real Petrinex production history per well (oil, gas, water volumes in m³)
- Arps decline curve fitting (exponential, hyperbolic, harmonic) via scipy
- Per-well 12-month production forecasts with EUR calculation
- Anomaly detection — flags months deviating >2σ from fitted decline curve
- Licensee summary — search by operator, view well count and status distribution
- Interactive Alberta map with well clustering (Leaflet)
- Real-time search across 661k wells by UWI, licensee, or status
- Quarterly automated data refresh via GitHub Actions cron (ST37 + Petrinex)

## Live Architecture

```
AER ST37 (shapefile + WellList.txt)
        ↓ load_st37.py (auto-download + upsert)
Petrinex Volumetric CSVs (18 months, auto-downloaded via public API)
        ↓ load_petrinex.py (gap-based rolling window, batch commits)
Neon PostgreSQL (wells + production tables, ~2.3M production rows)
        ↓ FastAPI (SQLAlchemy ORM, Alembic migrations)
Azure Web App (Docker container, East US 2)
        ↓ REST API
React (Vercel) → Recharts charts + Leaflet map
```

## Data Sources

- [AER ST37 - List of Wells in Alberta](https://www.aer.ca/data-and-performance-reports/statistical-reports/st37)
- [Petrinex Alberta Public Volumetric Data](https://www.petrinex.ca/public-data/)
- No proprietary or gated data sources — fully reproducible

## Known Limitations

- **~16% of active (PUMP) wells show no production data.** Investigation confirmed this reflects Petrinex's facility-level reporting architecture: many operators report combined volumes at a shared battery (`ABBT`) rather than per individual wellhead. Properly attributing battery-level volumes to individual wells requires production allocation — a domain-specific problem that dedicated O&G accounting software (Quorum, Pandell) solves using periodic well test data not available in public datasets.
- **Neon cold-start latency.** The database scales to zero when idle; the first request after a period of inactivity may take 2–5 seconds while Neon wakes up. SQLAlchemy connection pooling (`pool_pre_ping`, `pool_recycle=300`) mitigates mid-session drops.
- **18-month rolling window.** Petrinex data is trimmed to 18 months to fit within hosting constraints. The automated quarterly refresh maintains this window, deleting the oldest month and adding the newest available.

## O&G Domain Context

- **UWI** — Unique Well Identifier (Canadian DLS format e.g. `00/06-06-001-01W4/0`)
- **Arps Decline Curve** — Mathematical model of production decline: `q(t) = qi / (1 + b·Di·t)^(1/b)`
  - Exponential (b=0), Hyperbolic (0<b<1), Harmonic (b=1)
- **EUR** — Estimated Ultimate Recovery (projected lifetime production)
- **Petrinex** — Alberta's official volumetric and royalty submission portal
- **AER** — Alberta Energy Regulator
- **Battery (ABBT)** — Shared facility where multiple wells' production is measured collectively

## Getting Started

```bash
git clone https://github.com/KulvanshJaswal/alberta-well-forecaster.git
cd alberta-well-forecaster/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## CI/CD

- **On push to `main`:** GitHub Actions builds the Docker image and pushes to Azure Container Registry; Azure Web App pulls and redeploys automatically.
- **Quarterly (1st of Jan/Apr/Jul/Oct):** GitHub Actions runs `load_st37.py` and `load_petrinex.py` against the live Neon database, refreshing all well metadata and rolling the production window forward by one month.
