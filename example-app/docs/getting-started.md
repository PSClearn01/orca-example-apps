# Getting Started & Deployment Guide

This guide walks through local installation, development execution, type checking, production building, and containerized deployment using Docker and Docker Compose.

---

## 📋 Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v9.x` or higher
- **Docker & Docker Compose**: Optional, for container deployment

---

## 🛠️ Local Development Setup

1. **Navigate to the application directory**:
   ```bash
   cd example-app
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the local Vite development server**:
   ```bash
   npm run dev
   ```
   The application will start locally at `http://localhost:5173`.

---

## 🔍 Verification & Type Checking

To verify TypeScript interfaces and Svelte syntax correctness:
```bash
npm run check
```

---

## 🏗️ Production Build (Local Node Execution)

1. **Build the production SvelteKit server**:
   ```bash
   npm run build
   ```
   This compiles the project into the `build/` directory using `@sveltejs/adapter-node`.

2. **Run the production build**:
   ```bash
   node build
   ```
   By default, the production server runs on port `3000`. Customize port using environment variables:
   ```bash
   PORT=8080 node build
   ```

---

## 🐳 Docker Containerization

### Building & Running with Docker Directly

1. **Build Docker image**:
   ```bash
   docker build -t homelab-ipam-app .
   ```

2. **Run Docker container with volume mapping for persistence**:
   ```bash
   docker run -d \
     --name homelab-ipam \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     homelab-ipam-app
   ```

---

## 🐙 Docker Compose Deployment (Recommended)

To run the application via Docker Compose:

1. **Start the container service**:
   ```bash
   docker-compose up -d
   ```

2. **Check container logs**:
   ```bash
   docker-compose logs -f
   ```

3. **Stop container service**:
   ```bash
   docker-compose down
   ```

---

## ⚙️ Environment Variables

| Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port for Node production server |
| `NODE_ENV` | `production` | Execution environment (`development` or `production`) |
| `DATA_DIR` | `./data` | Directory where `homelab-db.json` file storage resides |
