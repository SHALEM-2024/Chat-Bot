# RAG Chatbot (Frontend + Backend) — Docker Compose Setup

<img width="1908" height="1063" alt="image" src="https://github.com/user-attachments/assets/78c338ab-ae52-4ac6-9672-4e9458b493f1" />

This project runs a **RAG (Retrieval-Augmented Generation)** chatbot as two services:

- **backend**: the API service (handles chat logic, retrieval, DB storage, OpenAI calls)
- **frontend**: the UI (served via Nginx on port 80)

You can run both services on any machine using **Docker Compose**.  
All you need is:

- `docker-compose.yaml`
- `.env` file (contains your OpenAI key)
- Docker + Docker Compose installed

---

## What You Get

When you start the stack:

- Frontend runs on: **http://localhost/** or on **http://public-ip/** (port 80 on the public ip of EC2 instance)
- Backend runs inside Docker and is reachable by the frontend using the Docker network

The backend also stores its SQLite database in a Docker **named volume** so your data is not lost when containers restart.

---

## Prerequisites

Install Docker and Docker Compose:

### Linux (Ubuntu)
- Docker Engine installed
- Docker Compose plugin available (`docker compose` command)

Check versions:
```bash
docker --version
docker compose version
