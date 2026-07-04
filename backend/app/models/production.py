from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Integer, Sequence
from app.database import Base
from sqlalchemy import UniqueConstraint

class Production(Base):
    __tablename__ = "production"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uwi = Column(String, ForeignKey("wells.uwi"), index=True)
    month = Column(DateTime, nullable=False, index=True)
    oil = Column(Float, nullable=True)
    water = Column(Float, nullable=True)
    gas = Column(Float, nullable=True)
    __table_args__ = (UniqueConstraint('uwi', 'month'),)