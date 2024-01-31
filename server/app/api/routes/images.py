from typing import List
import os
import glob

from fastapi import APIRouter, Response, Path

router = APIRouter()


@router.get("/")
async def get_all_images() -> List[dict]:
    images = []
    for r, d, f in os.walk("static"):
        for file in f:
            images.append({"variable": r.split("/")[1], "filepath": r + file})

    return images


@router.get(
    "/{variable}",
    response_class=Response,
    responses={
        200: {
            "content": {
                "image/png": {},
                "description": "Return an image",
            }
        }
    },
)
async def get_an_image(
    variable: str = Path(..., description="The name of variable to get")
):
    # get filename by variable
    filename = glob.glob(f"static/{variable}/*.png")[0]

    with open(filename, "rb") as f:
        data = f.read()

    return Response(content=data, media_type="image/png")
