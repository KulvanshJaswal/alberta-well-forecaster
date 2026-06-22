from app.models.well import Well
from sqlalchemy.orm import Session
from sqlalchemy import or_
def get_well(db: Session, uwi):
    return db.query(Well).filter(Well.uwi == uwi).first()

def get_all_wells(db: Session, skip: int = 0, limit: int = 100, search: str | None = None):
    query = db.query(Well)
    
    if search:
        query = query.filter(
            or_(
                Well.uwi.ilike(f"%{search}%"),
                Well.licensee.ilike(f"%{search}%"),
                Well.status.ilike(f"%{search}%")
            )
        )
    
    return query.offset(skip).limit(limit).all()