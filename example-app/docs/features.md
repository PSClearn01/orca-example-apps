# Features & Workflows

The Homelab Infrastructure Entities & IP Address Management (IPAM) application provides a unified control panel for homelab administrators to track hardware, virtualized infrastructure, network allocations, and system changes.

---

## 🖥️ Feature Breakdown

### 1. 📊 Executive Dashboard View
- **Metric Cards**: Quick visual counts of total managed entities, online status percentage, subnets managed, active IP allocations, and free IP capacity.
- **Subnet Utilization Overview**: Progress bars displaying capacity usage per subnet.
- **Recent Audit Activity Feed**: Quick stream of the 5 most recent infrastructure changes.

### 2. 🖧 Infrastructure Entity Manager
- **Categorized Tracking**:
  - **Hypervisors** (e.g. Proxmox VE, ESXi)
  - **Virtual Machines** (e.g. Home Assistant, TrueNAS, Media Server)
  - **Containers** (e.g. Docker, LXC, Pi-hole, Vaultwarden)
  - **Network Equipment** (e.g. Managed Switches, Routers, Access Points)
  - **Storage Devices** (e.g. NAS, SAN Array)
- **Status Toggling**: Real-time status toggling (`online`, `offline`, `maintenance`).
- **Resource Specs & Location**: Track CPU cores, RAM size, disk capacity, server rack location, and operating system.
- **MAC Address Auto-Generation**: Automatically suggests random QEMU/KVM MAC addresses (`52:54:00:XX:XX:XX`) when adding entities.
- **Filtering & Search**: Instant real-time filtering by entity type, status, name, IP address, MAC address, operating system, or tags.

### 3. 🌐 IPAM Octet Visualizer Grid
- **Interactive 256-Slot Subnet Map**:
  - Displays all 256 IP slots (0 through 255) for any selected IPv4 `/24` subnet.
  - Automatically identifies **Network Address** (`.0`), **Broadcast Address** (`.255`), and **Gateway Address** (e.g. `.1`).
- **Color-Coded Status Slots**:
  - 🟢 **Active**: Currently assigned and active on the network.
  - 🟡 **Reserved**: Reserved for future deployment or static assignment.
  - ⚪ **Free**: Available IP slot ready for allocation.
  - 🟣 **Gateway**: Subnet router gateway.
  - 🔒 **System**: Network/Broadcast reserved slots.
- **Slot Click Management**: Clicking any IP slot opens a modal to view existing details, edit hostname/MAC/notes, or allocate a free IP slot.

### 4. 🕸️ Subnet Provisioning
- Allows creation of new IPv4 subnets by specifying:
  - Subnet Name (e.g. `IoT & Smart Home VLAN`)
  - CIDR notation (e.g. `192.168.30.0/24`)
  - Router Gateway IP (e.g. `192.168.30.1`)
  - VLAN ID & Description

### 5. 📜 Audit Activity Log
- Full timeline of all infrastructure actions (adding/editing entities, reserving/releasing IP addresses, adding subnets).
- Search logs by message text or filter by category (`entity`, `ipam`, `subnet`).
