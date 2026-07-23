# Homelab Entities & IPAM Manager — Documentation

Welcome to the official documentation for the **Homelab Infrastructure Entity & IP Address Management (IPAM)** web application. This application is built with SvelteKit, TypeScript, Tailwind CSS styling tokens, Lucide icons, and a lightweight file-based server persistence engine.

---

## 📚 Documentation Index

| Guide | Description |
| :--- | :--- |
| 🏗️ **[System Architecture](./architecture.md)** | Overview of the SvelteKit frontend, server state, REST API endpoints, and data store persistence model. |
| 🚀 **[Getting Started & Deployment](./getting-started.md)** | Step-by-step guide for local node development, Docker builds, and Docker Compose deployment. |
| ✨ **[Features & Workflows](./features.md)** | Comprehensive walkthrough of entity management, visual IPAM grid, subnets, and activity logs. |
| 🔌 **[API Reference](./api-reference.md)** | Detailed JSON data schemas (`Subnet`, `HomelabEntity`, `IPAllocation`, `ActivityLog`) and REST endpoints. |

---

## ⚡ Quick Overview

- **Frontend Tech**: SvelteKit 2 + Svelte 5 Runes (`$state`, `$derived`, `$effect`), Lucide Icons.
- **Backend Tech**: Node.js server endpoints (`+server.ts`), file-backed JSON database engine (`db.ts`).
- **Containerization**: Multi-stage Dockerfile and Docker Compose configuration with volume persistence.
- **Primary Use Cases**: Homelab infrastructure asset tracking, CIDR subnet visualizer, static IP assignment tracking, and audit logging.
