from app.models.well import Well
from sqlalchemy.orm import Session

def get_all_wells(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Well).offset(skip).limit(limit).all()

def get_well(db: Session, uwi):
    return db.query(Well).filter(Well.uwi == uwi).first()