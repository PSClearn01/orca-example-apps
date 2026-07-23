# System Architecture

This document provides a technical deep-dive into the architectural design of the Homelab Infrastructure Entities & IPAM application.

---

## 📐 High-Level Overview

```
                  +-----------------------------------+
                  |        SvelteKit Web Client       |
                  |  (Dashboard, IPAM Grid, Entities) |
                  +-----------------+-----------------+
                                    |
                         HTTP / REST API Requests
                                    |
                                    v
                  +-----------------+-----------------+
                  |      SvelteKit Server Endpoints   |
                  |     (src/routes/api/.../+server)  |
                  +-----------------+-----------------+
                                    |
                        JSON File Operations (fs)
                                    |
                                    v
                  +-----------------+-----------------+
                  |   Data Store (homelab-db.json)    |
                  |      Persistent Storage Volume    |
                  +-----------------------------------+
```

---

## 🗂️ Component & Directory Structure

```
example-app/
├── Dockerfile                  # Multi-stage production container build configuration
├── docker-compose.yml          # Container orchestra & volume persistence spec
├── package.json                # Project dependencies and script definitions
├── svelte.config.js            # SvelteKit configuration (@sveltejs/adapter-node)
├── vite.config.ts              # Vite bundle configuration
├── docs/                       # Project documentation
│   ├── README.md               # Documentation entrypoint
│   ├── architecture.md         # System architecture document
│   ├── getting-started.md      # Setup & execution instructions
│   ├── features.md             # Functional walkthrough
│   └── api-reference.md        # API & schema reference
└── src/
    ├── app.css                 # Base CSS design system & utility styles
    ├── app.html                # Main HTML page template
    ├── lib/
    │   ├── types.ts            # TypeScript interfaces & types
    │   ├── server/
    │   │   └── db.ts           # JSON file persistence layer & seed data initialization
    │   └── components/
    │       ├── Navbar.svelte         # Top navigation header with tab switching
    │       ├── DashboardView.svelte  # Overview metrics, subnet summary, & recent logs
    │       ├── EntitiesView.svelte   # Infrastructure entity filter, search, & CRUD controls
    │       ├── AddEntityModal.svelte # Modal dialog for creating/editing hypervisors/VMs
    │       ├── IPAMView.svelte       # 256-slot IP octet grid visualizer
    │       ├── IPSlotModal.svelte    # Modal dialog to manage specific IP reservation
    │       ├── AddSubnetModal.svelte # Modal dialog for defining new CIDR subnets
    │       └── LogsView.svelte       # System audit log viewer with search & category filters
    └── routes/
        ├── +layout.svelte      # Root application wrapper
        ├── +page.server.ts     # SSR data loader (fetches subnets, entities, allocations, logs)
        ├── +page.svelte        # Single-page tab orchestrator
        └── api/
            ├── subnets/        # Subnet management endpoint GET/POST
            ├── entities/       # Infrastructure entity management endpoint GET/POST/PUT/DELETE
            └── ipam/           # IP allocation management endpoint GET/POST/DELETE
```

---

## 💾 Server Data Store Persistence Engine (`src/lib/server/db.ts`)

- **Location**: Data is stored at `process.env.DATA_DIR` or defaulted to `./data/homelab-db.json`.
- **Auto-Initialization**: If the data file or directory does not exist on startup, the system automatically creates the folder structure and seeds initial default data:
  - **Subnets**: Default `/24` subnets (Management `192.168.1.0/24`, Servers `192.168.10.0/24`, Storage `10.0.10.0/24`).
  - **Homelab Entities**: Pre-seeded Hypervisors (Proxmox), VMs (Home Assistant, TrueNAS Core), Containers (Docker, DNS Pi-hole), Network Switches, Storage nodes.
  - **IP Allocations**: IP reservation mappings with status (`active`, `reserved`, `gateway`).
  - **Activity Logs**: Pre-seeded infrastructure actions and audit trace entries.

---

## ⚛️ Frontend State Engine (Svelte 5 Runes)

The client application leverages modern Svelte 5 reactive primitives:
- `$state(...)`: Controls active view tabs, filter dropdowns, modal visibility, search queries, and working datasets.
- `$derived(...)` / `$derived.by(...)`: Dynamically filters entities by type/status, computes subnet utilization percentages, and maps IP octets (0..255) to allocation states.
- `$effect(...)`: Synchronizes form defaults when changing selected subnets or editing existing entity definitions.
