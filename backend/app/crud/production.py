from app.models.production import Production
from sqlalchemy.orm import Session


def get_well_production(db: Session, uwi):
    return db.query(Production).filter(Production.uwi == uwi).all()