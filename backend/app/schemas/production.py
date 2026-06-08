from pydantic import BaseModel
from datetime import datetime

class ProductionDetail(BaseModel):
    month: datetime
    oil: float
    water: float
    gas: float
    uwi: str