from app.models.well import Well
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
def get_well(db: Session, uwi):
    return db.query(Well).filter(Well.uwi == uwi).first()

def get_all_wells(db: Session, skip: int = 0, limit: int = 100, search: str | None = None, status: str | None = None):
    query = db.query(Well)

    if search:
        query = query.filter(
            or_(
                Well.uwi.ilike(f"%{search}%"),
                Well.licensee.ilike(f"%{search}%"),
                Well.status.ilike(f"%{search}%")
            )
        )

    elif status:
        query = query.filter(Well.status == status)
    
    return query.offset(skip).limit(limit).all()

def get_licensee_summary(db: Session, licensee: str):
    results = (
        db.query(Well.status, func.count(Well.uwi))
        .filter(Well.licensee == licensee)
        .group_by(Well.status)
        .all()
    )
    
    total_wells = sum(count for status, count in results)
    
    return {
        "licensee": licensee,
        "total_wells": total_wells,
        "status_breakdown": {status: count for status, count in results}
    }

def get_distinct_licensees(db: Session, search: str | None = None):
    if search is not None:
        query = db.query(Well.licensee).distinct().filter(
            Well.licensee.ilike(f"%{search}%")
        ).all()
    else:
        query = db.query(Well.licensee).distinct().all()

    return query