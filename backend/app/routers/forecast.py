from app.services.decline_curve import fit_decline_curve, forecast_production
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
        "oil": plot_values[0],
        "gas": plot_values[1],
        "water": plot_values[2]
    }