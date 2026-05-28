from sqlalchemy import Column, String, Float
from app.database import Base

class Well(Base):
    __tablename__ = "wells"

    uwi = Column(String, primary_key=True, index=True)
    licensee = Column(String, nullable=False)
    status = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)