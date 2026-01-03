# RAG Chatbot (Frontend + Backend) — Docker Compose Setup

1) It has memory of previous interactions.
2) It stores the interactions as conversations in a database.
3) It has 4 tools: Rag tool, Stock Price fetching tool(used Alpha Vantage API), Search tool using DuckDuckGoSearchRun, Basic Calculator.
4) Stylistic UI

##
   **Image for demonstration and Technical details are below** 

<img width="1908" height="1063" alt="image" src="https://github.com/user-attachments/assets/78c338ab-ae52-4ac6-9672-4e9458b493f1" />

##
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
```

## Usage

 - Pull images from dockerhub:

   ```docker compose pull```

 - Start containers:

   ```docker compose up -d```
  
 - Check status:
   
   ```docker compose ps```
   
   ```docker ps```



# 🤖 RAG & Agentic Chatbot (Full Stack)

![License](https://img.shields.io/badge/license-MIT-blue)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-orange)

A production-ready **Retrieval-Augmented Generation (RAG)** chatbot that goes beyond simple text generation. This project implements a **stateful AI agent** capable of managing conversation history, indexing PDF documents for context-aware answers, and autonomously calling external tools (Stock API, Calculator, Web Search).

The application is fully containerized with **Docker Compose**, featuring a **FastAPI** backend and a modern **React (Vite)** frontend served via **Nginx**.

---

## 📸 Demo

<img width="100%" alt="RAG Chatbot Interface" src="https://github.com/user-attachments/assets/78c338ab-ae52-4ac6-9672-4e9458b493f1" />

---

## ✨ Key Features

### 🧠 Advanced AI Capabilities
* **Agentic Workflow**: Built with **LangGraph**, allowing the LLM to decide when to use tools vs. when to answer directly.
* **Custom RAG Pipeline**: Indexes uploaded PDFs using FAISS and OpenAI Embeddings for precise, context-based answers.
* **Persistent Memory**: Uses SQLite checkpoints to remember conversation history across messages and sessions.

### 🛠️ Tool Usage (Function Calling)
The bot is equipped with specific tools it can invoke autonomously:
1.  **📄 RAG Tool**: Retrieves information from your uploaded PDF documents.
2.  **📈 Stock Price**: Fetches real-time data via the Alpha Vantage API.
3.  **🔍 Web Search**: Searches the internet using DuckDuckGo.
4.  **🧮 Calculator**: Performs accurate arithmetic operations.

### 🏗️ Modern Architecture
* **Backend**: Python **FastAPI** for high-performance asynchronous API handling.
* **Frontend**: **React** + **Vite** + **Tailwind CSS** with a polished "Aurora" glassmorphism UI.
* **DevOps**: Fully Dockerized with **Nginx** reverse proxy and named volumes for data persistence.

---

## 🚀 Getting Started

### Prerequisites
* Docker & Docker Compose installed.
* An OpenAI API Key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Configure Environment:**
    Create a `.env` file in the root directory and add your keys:
    ```env
    OPENAI_API_KEY=sk-your-openai-key-here
    # Optional: Custom DB path
    # DB_PATH=/data/chatbot.db
    ```

3.  **Run with Docker Compose:**
    ```bash
    docker compose pull
    docker compose up -d
    ```

4.  **Access the App:**
    Open your browser and navigate to:
    * **http://localhost/** (or your server's public IP)

---

## 📖 Usage Guide

1.  **Create a Thread**: Click "New" in the sidebar to start a fresh conversation context.
2.  **Upload Context**: Use the "Upload PDF" button to add a document to the current thread. The bot will now answer questions based on that file.
3.  **Ask Questions**:
    * *Contextual*: "Summarize the PDF I just uploaded."
    * *Live Data*: "What is the stock price of Apple?"
    * *Math*: "Calculate 15% of 8500."
    * *General*: "Who won the Super Bowl in 2024?" (Triggers Web Search)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
* Dockerized Frontend (Nginx) & Backend (FastAPI).
* Local SQLite persistence with Docker volumes.
* Basic RAG and Tool implementation.

### ⏳ Phase 2: Production-Ready Basics (Planned)
* **PostgreSQL Migration**: Replace SQLite to handle concurrent users safely.
* **Observability**: Add health checks and structured logging.
* **Database Migration Strategy**: Safe data movement tools.

### 🚀 Phase 3: Scalable Architecture (Planned)
* **Object Storage**: Move PDF file storage to S3.
* **Vector Database**: Migrate to `pgvector` or Pinecone for large-scale retrieval.
* **Load Balancing**: Run multiple backend replicas.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
