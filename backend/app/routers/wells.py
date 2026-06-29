from app.crud.wells import get_all_wells, get_well, get_licensee_summary
from app.database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/wells")
def get_wells(skip: int = 0, limit: int = 100, search:str|None = None, status:str|None = None, db: Session = Depends(get_db)):
    return get_all_wells(db, skip, limit, search, status)

@router.get("/wells/{uwi:path}")
def get_well_endpoint(uwi: str, db: Session = Depends(get_db)):
    return get_well(db, uwi)

@router.get("/licensees/{licensee:path}")
def get_licensee_summary_endpoint(licensee: str, db: Session = Depends(get_db)):
    return get_licensee_summary(db, licensee)