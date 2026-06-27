from fastapi import FastAPI
from app.routers import wells, production, forecast
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Alberta Well Forecaster",
    description="Well production forecasting tool using real AER and Petrinex data",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://alberta-well-forecaster.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wells.router)

app.include_router(production.router)

app.include_router(forecast.router)