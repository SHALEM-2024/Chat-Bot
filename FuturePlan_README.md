# RAG Chatbot — Roadmap (MVP → Better MVP → Scalable)

This repository contains a Dockerized **RAG (Retrieval-Augmented Generation)** chatbot system.

**RAG** means: the app first *retrieves* relevant text from your documents (search), then sends that text to an LLM (a “Large Language Model”, like OpenAI models) to generate an answer grounded in those documents.

---

## What’s in this project (current)

- **Frontend:** React (served via **Nginx**)
  - React is the web UI.
  - Nginx is a lightweight web server used to serve the built frontend and (optionally) forward API requests to the backend.
- **Backend:** FastAPI + LangGraph/LangChain (Python)
  - FastAPI is the Python web API framework.
  - LangChain/LangGraph orchestrate retrieval + chat flow.
- **Storage:** SQLite database persisted via a Docker volume
  - SQLite is a file-based database (single file). Great for MVP and local runs.

---

## ✅ Phase 1 — MVP (Completed)

**Goal:** Get a working end-to-end product running anywhere using Docker Compose.

### What’s included
- ✅ Dockerized **React frontend** + **FastAPI backend**
- ✅ Frontend served by **Nginx** inside the frontend container
- ✅ Environment-based config via `.env` (API keys, DB path, etc.)
- ✅ Local persistence using **SQLite** stored on a Docker volume  
  (so data survives container restarts)

### Why this phase
- Low friction
- Easy to debug
- Perfect for local use or a single server VM

---

## ⏳ Phase 2 — “Production-ready basics” (Planned)

**Goal:** Improve reliability, data safety, and readiness for multiple users / multiple sessions.

### Planned upgrades
- Replace SQLite with **Postgres**
  - Postgres is a server-based database built for concurrent usage (many users at once).
- Solidify database migration strategy (moving existing data safely)
- Improve observability (basic logs, health checks)

### What this enables
- Safer concurrent usage (no “file locked” or corruption risk typical of SQLite under load)
- Easier backups and restores
- A stable base for adding more features without fragile storage

---

## 🚀 Phase 3 — Scalable Architecture (Planned)

**Goal:** Scale documents, users, and traffic without redesigning everything again.

### Planned upgrades
- Store PDFs in **object storage** (example: S3-compatible storage)
  - Object storage is made for storing large files reliably.
- Run multiple backend replicas behind a load balancer
  - A load balancer is a component that spreads traffic across multiple backend copies.
- Choose scalable retrieval storage:
  - Either **pgvector** (vectors inside Postgres) or a dedicated vector DB if needed

### What this enables
- High traffic handling
- Better uptime
- More predictable performance with large document sets

---

## Status Summary

- ✅ **Phase 1:** Completed  
- ⏳ **Phase 2:** Planned  
- 🚀 **Phase 3:** Planned
