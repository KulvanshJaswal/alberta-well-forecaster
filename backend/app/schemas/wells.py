from pydantic import BaseModel
 
class WellBase(BaseModel):
    uwi: str    
    licensee: str
    status: str

class WellList(WellBase):
    pass

class WellDetail(WellBase):
    longitude: float
    latitude: float