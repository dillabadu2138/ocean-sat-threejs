from typing import List
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_all_images() -> List[dict]:
	images = [
		{
			"id": 1,
      "variable": "CHL",
      "path": "/data/20240101/001530/chlorophyll.png"
    },
    {
      "id": 2,
      "variable": "AOD",
      "path": "/data/20240101/001530/aod.png"
    },
  ]
	
	return images