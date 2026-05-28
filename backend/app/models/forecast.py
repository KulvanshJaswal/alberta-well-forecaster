from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.database import Base

class Forecast(Base):
    __tablename__ = "forecast"

    uwi = Column(String, ForeignKey("well.uwi"))
    id = Column(String, primary_key=True, index=True)
    qi = Column(Float, nullable = False)
    di = Column(Float, nullable = False)
    b = Column(Float, nullable = False)
    generated_at = Column(DateTime, nullable = False)