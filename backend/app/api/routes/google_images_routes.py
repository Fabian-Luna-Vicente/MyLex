
from fastapi import APIRouter
from app.services.google_images_service import GoogleImagesService

router = APIRouter()

@router.get("/images/search")
async def search_images(q: str, start: int = 1):
    service = GoogleImagesService()
    return await service.search_images(q, start)
