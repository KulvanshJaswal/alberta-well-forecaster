from fastapi import FastAPI

app = FastAPI(
    title="Alberta Well Forecaster",
    description="Well production forecasting tool using real AER and Petrinex data",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "Alberta Well Forecaster API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}