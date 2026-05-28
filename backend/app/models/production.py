from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.database import Base

class Production(Base):
    __tablename__ = "production"

    uwi = Column(String, ForeignKey("wells.uwi"))
    id = Column(String, primary_key=True, index=True)
    oil = Column(Float, nullable=False)
    water = Column(Float, nullable=False)
    gas = Column(Float, nullable=False)
    month = Column(DateTime, nullable=False)