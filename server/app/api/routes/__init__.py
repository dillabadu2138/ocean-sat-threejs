from fastapi import APIRouter
from app.api.routes.images import router as images_router

router = APIRouter()

router.include_router(images_router, prefix="/images", tags=["PNG 이미지"])
