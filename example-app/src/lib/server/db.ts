import fs from 'fs';
import path from 'path';
import type { Subnet, IPAllocation, HomelabEntity, ActivityLog } from '$lib/types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'homelab-db.json');

export interface DBData {
  subnets: Subnet[];
  allocations: IPAllocation[];
  entities: HomelabEntity[];
  logs: ActivityLog[];
}

const initialSubnets: Subnet[] = [
  {
    id: 'sub-mgmt',
    name: 'Management & Infra',
    cidr: '192.168.1.0/24',
    gateway: '192.168.1.1',
    vlan: 1,
    description: 'Core switches, hypervisors, and gateway equipment',
    color: '#3b82f6',
    dnsPrimary: '192.168.1.53',
    dnsSecondary: '1.1.1.1'
  },
  {
    id: 'sub-servers',
    name: 'Servers & Virtual Machines',
    cidr: '10.0.10.0/24',
    gateway: '10.0.10.1',
    vlan: 10,
    description: 'Production VMs, media servers, and database instances',
    color: '#8b5cf6',
    dnsPrimary: '192.168.1.53',
    dnsSecondary: '9.9.9.9'
  },
  {
    id: 'sub-containers',
    name: 'K8s & Docker Services',
    cidr: '10.0.20.0/24',
    gateway: '10.0.20.1',
    vlan: 20,
    description: 'Containerized workloads and reverse proxy VIPs',
    color: '#10b981',
    dnsPrimary: '192.168.1.53',
    dnsSecondary: '1.1.1.1'
  },
  {
    id: 'sub-iot',
    name: 'Smart Home & IoT',
    cidr: '172.16.50.0/24',
    gateway: '172.16.50.1',
    vlan: 50,
    description: 'Sensors, cameras, microcontrollers, and isolated smart devices',
    color: '#f59e0b',
    dnsPrimary: '1.1.1.1',
    dnsSecondary: '8.8.8.8'
  }
];

const initialEntities: HomelabEntity[] = [
  {
    id: 'ent-1',
    name: 'udm-pro-gateway',
    type: 'network',
    ip: '192.168.1.1',
    mac: '74:83:C2:11:AA:01',
    subnetId: 'sub-mgmt',
    vlan: 1,
    status: 'online',
    os: 'UniFi OS v3.2.12',
    specs: { cpu: '4-Core ARM Cortex-A57', ram: '4GB DDR4', disk: '1TB NVMe' },
    location: 'Rack Unit 1',
    tags: ['Router', 'Gateway', 'UniFi', 'Firewall'],
    notes: 'Main WAN gateway & UniFi Controller',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-2',
    name: 'pve-node-01',
    type: 'hypervisor',
    ip: '192.168.1.10',
    mac: 'E4:5F:01:4B:C8:10',
    subnetId: 'sub-mgmt',
    vlan: 1,
    status: 'online',
    os: 'Proxmox VE 8.1.4',
    specs: { cpu: 'AMD EPYC 7302P (16C/32T)', ram: '128GB ECC DDR4', disk: '2x 2TB NVMe ZFS Mirror' },
    location: 'Rack Unit 3',
    tags: ['Hypervisor', 'Proxmox', 'Compute', 'Production'],
    notes: 'Primary virtualization node',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-3',
    name: 'pve-node-02',
    type: 'hypervisor',
    ip: '192.168.1.11',
    mac: 'E4:5F:01:4B:C8:11',
    subnetId: 'sub-mgmt',
    vlan: 1,
    status: 'online',
    os: 'Proxmox VE 8.1.4',
    specs: { cpu: 'AMD Ryzen 9 7900X (12C/24T)', ram: '64GB DDR5', disk: '2x 1TB NVMe ZFS Mirror' },
    location: 'Rack Unit 4',
    tags: ['Hypervisor', 'Proxmox', 'Compute', 'HA Cluster'],
    notes: 'Secondary compute node in HA cluster',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-4',
    name: 'truenas-scale-01',
    type: 'storage',
    ip: '192.168.1.20',
    mac: 'A0:36:BC:55:12:34',
    subnetId: 'sub-mgmt',
    vlan: 1,
    status: 'online',
    os: 'TrueNAS SCALE 23.10.1',
    specs: { cpu: 'Intel Xeon E-2388G', ram: '64GB ECC DDR4', disk: '8x 16TB ZFS RAIDZ2 (96TB Net)' },
    location: 'Rack Unit 6',
    tags: ['NAS', 'Storage', 'ZFS', 'NFS', 'iSCSI'],
    notes: 'Main NFS datastore & S3 Object Storage',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-5',
    name: 'pihole-dns-primary',
    type: 'service',
    ip: '192.168.1.53',
    mac: 'DC:A6:32:88:99:53',
    subnetId: 'sub-mgmt',
    vlan: 1,
    status: 'online',
    os: 'Debian 12 (Alpine LXC)',
    specs: { cpu: '2 vCPU', ram: '2GB', disk: '16GB SSD' },
    location: 'pve-node-01',
    tags: ['DNS', 'AdBlock', 'Unbound', 'DHCP'],
    notes: 'Primary Recursive DNS + Ad blocking via Unbound',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-6',
    name: 'k8s-control-plane-01',
    type: 'vm',
    ip: '10.0.10.15',
    mac: '52:54:00:12:34:56',
    subnetId: 'sub-servers',
    vlan: 10,
    status: 'online',
    os: 'Ubuntu 24.04 LTS (Talos Linux)',
    specs: { cpu: '4 vCPU', ram: '8GB', disk: '60GB SSD' },
    location: 'pve-node-01',
    tags: ['Kubernetes', 'Talos', 'ControlPlane', 'K8s'],
    notes: 'Kubernetes Master Node 01',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-7',
    name: 'k8s-worker-node-01',
    type: 'vm',
    ip: '10.0.10.21',
    mac: '52:54:00:12:34:57',
    subnetId: 'sub-servers',
    vlan: 10,
    status: 'online',
    os: 'Ubuntu 24.04 LTS',
    specs: { cpu: '8 vCPU', ram: '32GB', disk: '120GB SSD' },
    location: 'pve-node-01',
    tags: ['Kubernetes', 'WorkerNode', 'Docker'],
    notes: 'K8s GPU / Heavy workloads node',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-8',
    name: 'plex-media-server',
    type: 'vm',
    ip: '10.0.10.50',
    mac: '52:54:00:AB:CD:01',
    subnetId: 'sub-servers',
    vlan: 10,
    status: 'online',
    os: 'Ubuntu 22.04 LTS (Docker)',
    specs: { cpu: '6 vCPU + Intel QuickSync', ram: '16GB', disk: '50GB SSD + NFS Mounts' },
    location: 'pve-node-02',
    tags: ['Media', 'Plex', 'Arr-Suite', 'Transcoding'],
    notes: 'Plex Media Server with iGPU pass-through',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-9',
    name: 'nginx-proxy-manager',
    type: 'container',
    ip: '10.0.20.5',
    mac: '02:42:0A:00:14:05',
    subnetId: 'sub-containers',
    vlan: 20,
    status: 'online',
    os: 'Docker (Alpine)',
    specs: { cpu: '1 vCPU', ram: '1GB', disk: '10GB' },
    location: 'k8s-worker-node-01',
    tags: ['ReverseProxy', 'SSL', 'LetEncrypt', 'Gateway'],
    notes: 'TLS termination and internal domain routing (*.lab.home)',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-10',
    name: 'home-assistant-os',
    type: 'vm',
    ip: '10.0.10.80',
    mac: '52:54:00:80:80:80',
    subnetId: 'sub-servers',
    vlan: 10,
    status: 'online',
    os: 'Home Assistant OS 11.5',
    specs: { cpu: '4 vCPU', ram: '4GB', disk: '64GB SSD' },
    location: 'pve-node-01',
    tags: ['SmartHome', 'HomeAssistant', 'Zigbee', 'Automation'],
    notes: 'Home automation core with Sonoff Zigbee 3.0 dongle',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-11',
    name: 'usw-pro-24-poe',
    type: 'network',
    ip: '192.168.1.2',
    mac: '74:83:C2:22:BB:02',
    subnetId: 'sub-mgmt',
    vlan: 1,
    status: 'warning',
    os: 'UniFi Switch OS v6.5.59',
    specs: { cpu: 'ARM Cortex A9', ram: '512MB', disk: 'Flash' },
    location: 'Rack Unit 2',
    tags: ['Switch', 'PoE+', '10G SFP+', 'VLAN'],
    notes: 'Core Layer 2/3 24-Port PoE Switch (Port 18 high temp warning)',
    lastSeen: new Date().toISOString()
  },
  {
    id: 'ent-12',
    name: 'zigbee-gateway-ethernet',
    type: 'iot',
    ip: '172.16.50.12',
    mac: 'AC:D0:74:11:22:33',
    subnetId: 'sub-iot',
    vlan: 50,
    status: 'online',
    os: 'ESP32 Tasmota',
    specs: { cpu: 'ESP32 Dual Core', ram: '520KB', disk: '4MB Flash' },
    location: 'Living Room Ceiling',
    tags: ['IoT', 'Zigbee', 'ESP32', 'Sensor'],
    notes: 'Ethernet Zigbee Coordinator',
    lastSeen: new Date().toISOString()
  }
];

function generateAllocations(subnets: Subnet[], entities: HomelabEntity[]): IPAllocation[] {
  const allocations: IPAllocation[] = [];

  // Add entities
  for (const ent of entities) {
    allocations.push({
      id: `alloc-${ent.ip.replace(/\./g, '-')}`,
      subnetId: ent.subnetId,
      ip: ent.ip,
      hostname: ent.name,
      entityId: ent.id,
      status: 'active',
      mac: ent.mac,
      notes: ent.notes || `${ent.type.toUpperCase()} assignment`,
      updatedAt: new Date().toISOString()
    });
  }

  // Add some gateways / reserved IPs
  for (const sub of subnets) {
    // Gateway
    if (!allocations.some(a => a.ip === sub.gateway)) {
      allocations.push({
        id: `alloc-${sub.gateway.replace(/\./g, '-')}`,
        subnetId: sub.id,
        ip: sub.gateway,
        hostname: `${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-gw`,
        status: 'reserved',
        notes: 'Subnet Gateway IP',
        updatedAt: new Date().toISOString()
      });
    }

    // Network / Broadcast (implicit reserved in subnet map)
  }

  return allocations;
}

const initialLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'IP Allocated',
    details: 'Assigned 10.0.20.5 to nginx-proxy-manager',
    type: 'success'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    action: 'Device Warning',
    details: 'usw-pro-24-poe reported elevated temperature (68°C)',
    type: 'warning'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    action: 'Entity Registered',
    details: 'New Proxmox hypervisor node pve-node-02 registered',
    type: 'info'
  }
];

class DBStore {
  private data: DBData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DBData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading DB file, falling back to defaults:', e);
    }

    const defaultAllocations = generateAllocations(initialSubnets, initialEntities);
    const initialData: DBData = {
      subnets: initialSubnets,
      entities: initialEntities,
      allocations: defaultAllocations,
      logs: initialLogs
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data?: DBData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB file:', e);
    }
  }

  public getSubnets(): Subnet[] {
    return this.data.subnets;
  }

  public getEntities(): HomelabEntity[] {
    return this.data.entities;
  }

  public getAllocations(): IPAllocation[] {
    return this.data.allocations;
  }

  public getLogs(): ActivityLog[] {
    return this.data.logs;
  }

  public addEntity(entity: Omit<HomelabEntity, 'id' | 'lastSeen'>): HomelabEntity {
    const newId = `ent-${Date.now()}`;
    const newEntity: HomelabEntity = {
      ...entity,
      id: newId,
      lastSeen: new Date().toISOString()
    };
    this.data.entities.unshift(newEntity);

    // Also update/add allocation
    const allocIdx = this.data.allocations.findIndex(a => a.ip === newEntity.ip);
    const newAlloc: IPAllocation = {
      id: `alloc-${newEntity.ip.replace(/\./g, '-')}`,
      subnetId: newEntity.subnetId,
      ip: newEntity.ip,
      hostname: newEntity.name,
      entityId: newEntity.id,
      status: 'active',
      mac: newEntity.mac,
      notes: newEntity.notes || `${newEntity.type} host`,
      updatedAt: new Date().toISOString()
    };

    if (allocIdx >= 0) {
      this.data.allocations[allocIdx] = newAlloc;
    } else {
      this.data.allocations.push(newAlloc);
    }

    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Entity Created',
      details: `Added ${newEntity.name} (${newEntity.ip})`,
      type: 'success'
    });

    this.saveData();
    return newEntity;
  }

  public updateEntity(id: string, updates: Partial<HomelabEntity>): HomelabEntity | null {
    const idx = this.data.entities.findIndex(e => e.id === id);
    if (idx === -1) return null;

    const oldEntity = this.data.entities[idx];
    const updated: HomelabEntity = {
      ...oldEntity,
      ...updates,
      lastSeen: new Date().toISOString()
    };
    this.data.entities[idx] = updated;

    // Update matching IP allocation if IP changed
    const allocIdx = this.data.allocations.findIndex(a => a.entityId === id || a.ip === oldEntity.ip);
    if (allocIdx >= 0) {
      this.data.allocations[allocIdx] = {
        ...this.data.allocations[allocIdx],
        ip: updated.ip,
        hostname: updated.name,
        subnetId: updated.subnetId,
        mac: updated.mac,
        updatedAt: new Date().toISOString()
      };
    }

    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Entity Updated',
      details: `Updated ${updated.name}`,
      type: 'info'
    });

    this.saveData();
    return updated;
  }

  public deleteEntity(id: string): boolean {
    const idx = this.data.entities.findIndex(e => e.id === id);
    if (idx === -1) return false;

    const removed = this.data.entities.splice(idx, 1)[0];
    // Remove allocation or mark free
    this.data.allocations = this.data.allocations.filter(a => a.entityId !== id && a.ip !== removed.ip);

    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Entity Removed',
      details: `Removed entity ${removed.name} (${removed.ip})`,
      type: 'warning'
    });

    this.saveData();
    return true;
  }

  public setIPAllocation(allocation: Omit<IPAllocation, 'id' | 'updatedAt'>): IPAllocation {
    const existingIdx = this.data.allocations.findIndex(a => a.ip === allocation.ip);
    const newAlloc: IPAllocation = {
      ...allocation,
      id: `alloc-${allocation.ip.replace(/\./g, '-')}`,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.data.allocations[existingIdx] = newAlloc;
    } else {
      this.data.allocations.push(newAlloc);
    }

    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'IP Allocation Updated',
      details: `Set IP ${allocation.ip} to status: ${allocation.status} (${allocation.hostname || 'Unassigned'})`,
      type: 'info'
    });

    this.saveData();
    return newAlloc;
  }

  public addSubnet(subnet: Omit<Subnet, 'id'>): Subnet {
    const id = `sub-${Date.now()}`;
    const newSubnet: Subnet = { ...subnet, id };
    this.data.subnets.push(newSubnet);

    // reserve gateway IP
    if (newSubnet.gateway) {
      this.setIPAllocation({
        subnetId: id,
        ip: newSubnet.gateway,
        hostname: `${newSubnet.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-gw`,
        status: 'reserved',
        notes: 'Subnet Gateway'
      });
    }

    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Subnet Created',
      details: `Added new CIDR ${newSubnet.cidr} (${newSubnet.name})`,
      type: 'success'
    });

    this.saveData();
    return newSubnet;
  }
}

export const db = new DBStore();
