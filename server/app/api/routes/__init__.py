from fastapi import APIRouter
from app.api.routes.files import router as files_router

router = APIRouter()

router.include_router(files_router, prefix="/files", tags=["정적 서버 파일"])
