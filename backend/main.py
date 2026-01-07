from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import init_db
from routers import auth, evaluations, admin

app = FastAPI(
    title="Ophthalmology Evaluation Platform API",
    description="API for collecting expert evaluations of retinal image segmentations",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(evaluations.router)
app.include_router(admin.router)

# Serve static files (for local development - images)
# Serve static files (the 'database' directory containing original_imgs and overlay_imgs)
# We go up one level from 'backend' to root, then into 'database'
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database"))
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
async def root():
    return {"message": "Ophthalmology Evaluation Platform API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
