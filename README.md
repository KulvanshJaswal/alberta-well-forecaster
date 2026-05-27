# Alberta Well Forecaster

A full-stack well production forecasting tool built with FastAPI and PostgreSQL,
seeded with real Alberta Energy Regulator (AER) and Petrinex public data.
Fits Arps decline curves per well to project future production and flag
underperforming wells — the core methodology used by Calgary production
engineers and reserves analysts daily.

Built as a portfolio project targeting Calgary oil & gas internships.

## Tech Stack

**Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, SciPy  
**Frontend:** React, Recharts, Leaflet  
**Data:** AER ST37 (well registry), Petrinex Alberta Public Volumetric CSVs  
**Deployment:** Docker, GitHub Actions CI/CD, Render/Azure  

## Features

- Real well data seeded from AER ST37 (UWIs, locations, licensee, status)
- 24 months of real Petrinex production history per well (oil, gas, water)
- Arps decline curve fitting (exponential, hyperbolic, harmonic) via scipy
- Per-well 90-day, 1-year, and EUR production forecasts
- Portfolio roll-up by operator and formation
- Anomaly detection — flags wells deviating >2σ from fitted curve
- Data quality page highlighting missing or suspicious monthly volumes

## Data Sources

- [AER ST37 - List of Wells in Alberta](https://www.aer.ca/data-and-performance-reports/statistical-reports/st37)
- [Petrinex Alberta Public Volumetric Data](https://www.petrinex.ca/public-data/)
- No proprietary or gated data sources used — fully reproducible

## O&G Domain Context

This project replicates the core analytical workflow a production engineer
runs monthly across their well portfolio:

- **UWI** — Unique Well Identifier (Canadian DLS format e.g. 100/01-02-003-04W5/00)
- **BOEPD** — Barrels of Oil Equivalent Per Day (gas converted at 6 mcf = 1 BOE)
- **Arps Decline Curve** — Mathematical model of production decline over time
  - Exponential (b=0), Hyperbolic (0<b<1), Harmonic (b=1)
  - q(t) = qi / (1 + b·Di·t)^(1/b)
- **EUR** — Estimated Ultimate Recovery (total projected lifetime production)
- **Water cut** — Water as % of total fluid produced
- **GOR** — Gas-Oil Ratio (scf/bbl)
- **Petrinex** — Alberta's official volumetric and royalty submission portal
- **AER** — Alberta Energy Regulator

## Architecture
