export type EntityType = 
  | 'hypervisor'
  | 'vm'
  | 'container'
  | 'network'
  | 'storage'
  | 'iot'
  | 'service';

export type EntityStatus = 'online' | 'offline' | 'warning';

export type IPStatus = 'active' | 'reserved' | 'dhcp' | 'free';

export interface Subnet {
  id: string;
  name: string;
  cidr: string;
  gateway: string;
  vlan: number;
  description: string;
  color: string;
  dnsPrimary?: string;
  dnsSecondary?: string;
}

export interface IPAllocation {
  id: string;
  subnetId: string;
  ip: string;
  hostname: string;
  entityId?: string;
  status: IPStatus;
  mac?: string;
  notes?: string;
  updatedAt: string;
}

export interface HomelabEntity {
  id: string;
  name: string;
  type: EntityType;
  ip: string;
  mac: string;
  subnetId: string;
  vlan: number;
  status: EntityStatus;
  os?: string;
  specs?: {
    cpu?: string;
    ram?: string;
    disk?: string;
  };
  location?: string;
  tags: string[];
  notes?: string;
  lastSeen?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}
