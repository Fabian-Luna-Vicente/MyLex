from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth_routes, vocabulary_routes, ai_routes, progress_routes, google_images_routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:8000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex="chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

# Include routers
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(vocabulary_routes.router, prefix="/api", tags=["Vocabulary"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["AI Tools"])
app.include_router(progress_routes.router, prefix="/api", tags=["Game Progress"])
app.include_router(google_images_routes.router, prefix="/api", tags=["Google Images"])
