# 🏷️ Homelab Entities & IP Address Management (IPAM) App

A modern, fast SvelteKit web application designed to help homelab administrators organize infrastructure entities (Hypervisors, VMs, Containers, Network switches, NAS Storage) alongside visual 256-slot IPv4 IP Address Management (IPAM) grids, subnets, and real-time audit logs.

---

## 📖 Quick Links

- 📚 **[Full Documentation Hub](./docs/README.md)**
- 🏗️ **[System Architecture](./docs/architecture.md)**
- 🚀 **[Getting Started & Docker Guide](./docs/getting-started.md)**
- ✨ **[Feature Walkthrough](./docs/features.md)**
- 🔌 **[REST API Reference](./docs/api-reference.md)**

---

## ⚡ Quick Start

### Local Node Development

```bash
# 1. Install dependencies
npm install

# 2. Run type check
npm run check

# 3. Start development server
npm run dev
```

### Production Build & Run

```bash
npm run build
node build
```

### 🐳 Docker & Docker Compose

```bash
# Run with Docker Compose
docker-compose up -d
```

---

## 📦 Stack & Tools

- **Framework**: SvelteKit 2 + Svelte 5 Runes (`$state`, `$derived`, `$effect`)
- **Language**: TypeScript
- **Styling**: Modern CSS Design System + Dark Theme Glassmorphism
- **Icons**: Lucide Svelte (`@lucide/svelte`)
- **Persistence**: File-backed JSON storage engine (`src/lib/server/db.ts`)
- **Adapter**: `@sveltejs/adapter-node`
- **Deployment**: Dockerfile & docker-compose.yml
