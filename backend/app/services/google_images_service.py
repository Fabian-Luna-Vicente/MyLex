import os
import httpx

class GoogleImagesService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_IMAGE_API_KEY")
        self.search_engine_id = os.getenv("SEARCH_ENGINE_ID")
    
    async def search_images(self, query: str, start: int = 1):
        url = f"https://www.googleapis.com/customsearch/v1?key={self.api_key}&cx={self.search_engine_id}&lr=lang_en&q={query}&searchType=image&start={start}"
    
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            return response.json()