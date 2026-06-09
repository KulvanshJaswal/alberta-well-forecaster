from fastapi import FastAPI
from app.routers import wells, production, forecast

app = FastAPI(
    title="Alberta Well Forecaster",
    description="Well production forecasting tool using real AER and Petrinex data",
    version="0.1.0"
)

app.include_router(wells.router)

app.include_router(production.router)

app.include_router(forecast.router)