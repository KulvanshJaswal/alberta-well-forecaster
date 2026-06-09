from app.services.decline_curve import fit_decline_curve, forecast_production, calculate_eur, detect_anomalies
from app.crud.production import get_well_production
from app.database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/forecast/{uwi:path}")
def get_uwi_forecast(uwi, db: Session = Depends(get_db)):
    well_info = get_well_production(db, uwi)

    well_production = fit_decline_curve(well_info)

    plot_values = []

    for key, record in well_production.items():
        if record is None:
            plot_values.append(None)
        else:
            plot_values.append(forecast_production(*record))
    return {
        "oil": {
            "forecast": plot_values[0],
            "eur": calculate_eur(*well_production["oil"]) if well_production["oil"] else None,
            "anomalies": detect_anomalies(well_info, *well_production["oil"], "oil") if well_production["oil"] else None
        },
        "gas":{
            "forecast": plot_values[1],
            "eur": calculate_eur(*well_production["gas"]) if well_production["gas"] else None,
            "anomalies": detect_anomalies(well_info, *well_production["gas"], "gas") if well_production["gas"] else None
        },
        "water":{
            "forecast": plot_values[2],
            "eur": calculate_eur(*well_production["water"]) if well_production["water"] else None,
            "anomalies": detect_anomalies(well_info, *well_production["water"], "water") if well_production["water"] else None
        },
    }