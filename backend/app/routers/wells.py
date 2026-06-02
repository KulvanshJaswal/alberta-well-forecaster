from app.crud.wells import get_all_wells, get_well
from app.database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/wells")
def get_wells(db: Session = Depends(get_db)):
    return get_all_wells(db)

@router.get("/wells/{uwi:path}")
def get_well_endpoint(uwi: str, db: Session = Depends(get_db)):
    return get_well(db, uwi)