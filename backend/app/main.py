from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.api.routes import auth_routes, vocabulary_routes, ai_routes, progress_routes, google_images_routes, profile_routes, chat_routes
from app.core.limiter import limiter
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import (
    ResourceNotFoundError, PermissionDeniedError, ValidationError, AuthenticationError, ExternalServiceError
)

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

app.state.limiter=limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/")
@limiter.limit("10/minute")
def root(request: Request):
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(status_code=404, content={"detail": exc.detail})

@app.exception_handler(PermissionDeniedError)
async def permission_denied_handler(request: Request, exc: PermissionDeniedError):
    return JSONResponse(status_code=403, content={"detail": exc.detail})

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=400, content={"detail": exc.detail})

@app.exception_handler(AuthenticationError)
async def auth_error_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(status_code=401, content={"detail": exc.detail})

@app.exception_handler(ExternalServiceError)
async def external_service_error_handler(request: Request, exc: ExternalServiceError):
    return JSONResponse(status_code=503, content={"detail": exc.detail})

# Include routers
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(vocabulary_routes.router, prefix="/api", tags=["Vocabulary"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["AI Tools"])
app.include_router(progress_routes.router, prefix="/api", tags=["Game Progress"])
app.include_router(google_images_routes.router, prefix="/api", tags=["Google Images"])
app.include_router(profile_routes.router, prefix="/api", tags=["Profile & Friends"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["Chat & Gamification"])

