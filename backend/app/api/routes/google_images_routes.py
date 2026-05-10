
from fastapi import APIRouter, Depends
from app.services.google_images_service import GoogleImagesService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/images/search")
async def search_images(q: str, start: int = 1,  current_user: User = Depends(get_current_user)):
    service = GoogleImagesService()
    return await service.search_images(q, start)
