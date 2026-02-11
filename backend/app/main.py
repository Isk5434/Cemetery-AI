from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import contracts

app = FastAPI(title="Cemetery AI SaaS PoC", version="0.1.0")

# CORS for Frontend
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Cemetery AI SaaS API is running"}

app.include_router(contracts.router, prefix="/api/v1", tags=["contracts"])
from app.routers import inheritance
app.include_router(inheritance.router, prefix="/api/v1", tags=["inheritance"])
