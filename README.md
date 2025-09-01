# Docker Express App

A simple Express.js app with MongoDB, containerized using Docker.

## What's included

- Basic Express server
- MongoDB connection
- CRUD operations for items
- Docker setup with compose

## How to run

```bash
# Start everything
docker compose up --build

# Run with watch mode for development
docker compose up --watch

# Stop containers
docker compose down
```

## Endpoints

- GET / - Basic info about the server
- GET /api/items - Get all items
- POST /api/items - Add new item (need name in JSON)
- GET /api/items/:id - Get one item
- DELETE /api/items/:id - Delete an item
- GET /health - Check if everything is working

## Docker setup

- Express app container runs on port 3000
- MongoDB container with persistent storage
- Both containers connected in the same network

## Commands I used

- `docker init` - Set up Docker files
- `docker compose up --build` - Build and run everything
- `docker compose up --watch` - Run with auto-reload for development

<img width="3199" height="1999" alt="image" src="https://github.com/user-attachments/assets/3ac7c0a9-34da-4966-88b5-e5afe3f3192e" />
<img width="2547" height="1489" alt="image" src="https://github.com/user-attachments/assets/ad7ac506-ac98-4c4c-8624-70bf9199cbdc" />


