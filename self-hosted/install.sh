#!/bin/bash
set -euv

#Git Pull
git pull

#Rebuild Frontend
CI_COMMIT=latest docker compose -f docker-compose.frontend-build.yml up --build

#Rebuild App
CI_COMMIT=latest docker compose -f docker-compose.yml build --no-cache

#Restart Service
docker compose -f docker-compose.yml stop && docker compose -f docker-compose.yml up -d