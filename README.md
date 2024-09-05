# partos-pat
Power Awarness Tool

[![Coverage Status](https://coveralls.io/repos/github/akvo/partos-pat/badge.svg?branch=main)](https://coveralls.io/github/akvo/partos-pat?branch=main) [![DBdocs](https://img.shields.io/website?url=http%3A%2F%2Fdbdocs.io%2Fakvo%2Fpartos-pat&style=flat&logo=docsdotrs&logoColor=%23fff&label=dbdocs&labelColor=%230246cc&color=%235e5e5e&link=http%3A%2F%2Fdbdocs.io%2Fakvo%2Fpartos-pat)](https://dbdocs.io/akvo/partos-pat)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Services](#services)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [API Documentation](#api-documentation)
  - [PgAdmin](#pgadmin)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) should be installed on your machine.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/akvo/partos-pat.git
   cd partos-pat
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env` and change the values to suit your local environment:
     ```bash
     cp .env.example .env
     ```
   - Set the desired values for the following variables:
   ```
   MAILJET_APIKEY=YOUR_MAILJET_API_KEY
   MAILJET_SECRET=YOUR_MAILJET_SECRET
   WEBDOMAIN="<<full site URL (default: http://localhost:3000)>>"
   ```

3. **Build and Start the Containers**:

   Run the following command to build and start all services:
   ```bash
   docker compose up -d
   ```
   This will spin up the following services:
   - Backend
   - Frontend
   - PostgreSQL Database
   - PgAdmin

4. **Stopping the Containers**:

   To stop the containers without removing them, run:
   ```bash
   docker compose stop
   ```

   To stop and remove the containers, networks, and volumes, run:
   ```bash
   docker compose down
   ```

## Services

### Backend

The backend service runs on **port 8000** and handles the core application logic. Access it at [http://localhost:8000](http://localhost:8000).

### Frontend

The frontend service runs on **port 3000** and provides the user interface. Access it at [http://localhost:3000](http://localhost:3000).

### API Documentation

API documentation (Swagger) is hosted at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

### PgAdmin

PgAdmin for managing your PostgreSQL database is accessible on **port 5050**. Access it at [http://localhost:5050](http://localhost:5050).

#### PgAdmin Credentials

Use the following credentials to log in to PgAdmin:

- **Email**: `dev@akvo.org`
- **Password**: `password`


---
## Troubleshooting

- If a service fails to start, check the logs with:
  ```bash
  docker compose logs <service-name>
  ```

- Common issues may include port conflicts or missing environment variables. Ensure all ports are available and all required `.env` files are present.
