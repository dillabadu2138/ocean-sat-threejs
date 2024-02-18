from typing import List
import os
import glob

from fastapi import APIRouter, Response, Path

router = APIRouter()


@router.get("/")
async def get_all_static_files() -> List[dict]:
    files = []
    for r, d, f in os.walk("static"):
        for file in f:
            files.append({"variable": r.split("/")[1], "filepath": r + "/" + file})

    return files


@router.get(
    "/image/{variable}",
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


@router.get(
    "/binary/{variable}",
    response_class=Response,
    responses={
        200: {
            "content": {
                "application/octet-stream": {},
                "description": "Return a binary file",
            }
        }
    },
)
async def get_a_binary(
    variable: str = Path(..., description="The name of variable to get")
):
    # get filename by variable
    filename = glob.glob(f"static/{variable}/*.dat")[0]

    with open(filename, "rb") as f:
        data = f.read()

    return Response(content=data, media_type="application/octet-stream")
