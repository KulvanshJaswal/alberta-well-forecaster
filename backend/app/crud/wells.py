from app.models.well import Well
from sqlalchemy.orm import Session

def get_all_wells(db: Session):
    return db.query(Well).all()

def get_well(db: Session, uwi):
    return db.query(Well).filter(Well.uwi == uwi).first()