# pull the official docker image
FROM python:3.10-slim-buster

# set a working directory
WORKDIR /server

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONBUFFERED 1

# copy the requirements file
COPY ./requirements.txt /server/requirements.txt

# upgrade pip
RUN pip install --upgrade pip

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy all the code in the build context
COPY . /server