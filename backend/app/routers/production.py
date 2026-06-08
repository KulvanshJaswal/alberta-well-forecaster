from app.crud.production import get_well_production
from app.database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/production/{uwi:path}")
def get_well_production_endpoint(uwi: str, db: Session = Depends(get_db)):
    return get_well_production(db, uwi)

