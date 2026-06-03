from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Integer, Sequence
from app.database import Base

class Production(Base):
    __tablename__ = "production"

    uwi = Column(String, ForeignKey("wells.uwi"))
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    oil = Column(Float, nullable=False)
    water = Column(Float, nullable=False)
    gas = Column(Float, nullable=False)
    month = Column(DateTime, nullable=False)