# REST API & Data Schema Reference

This reference documents the TypeScript data models and server API endpoints provided by the application.

---

## 📐 Data Schemas (`src/lib/types.ts`)

### `HomelabEntity`
Represents a physical or virtual machine, container, or network hardware asset.

```typescript
export type EntityType = 'hypervisor' | 'vm' | 'container' | 'network' | 'storage';
export type EntityStatus = 'online' | 'offline' | 'maintenance';

export interface HomelabEntity {
  id: string;
  name: string;
  type: EntityType;
  subnetId: string;
  ip: string;
  mac: string;
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
  createdAt: string;
  updatedAt: string;
}
```

### `Subnet`
Represents an IPv4 network segment.

```typescript
export interface Subnet {
  id: string;
  name: string;
  cidr: string;
  gateway: string;
  vlan?: number;
  description?: string;
}
```

### `IPAllocation`
Represents an assigned or reserved IP slot within a subnet.

```typescript
export type IPStatus = 'active' | 'reserved' | 'free';

export interface IPAllocation {
  id: string;
  subnetId: string;
  ip: string;
  hostname: string;
  mac?: string;
  entityId?: string;
  status: IPStatus;
  notes?: string;
  assignedAt: string;
}
```

### `ActivityLog`
Represents an audit event trace.

```typescript
export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'entity' | 'ipam' | 'subnet';
  details: string;
}
```

---

## 🌐 REST API Endpoints

### 1. Subnets API (`/api/subnets`)

- **`GET /api/subnets`**
  - **Returns**: `Subnet[]` list of all subnets.

- **`POST /api/subnets`**
  - **Body**: `{ name: string, cidr: string, gateway: string, vlan?: number, description?: string }`
  - **Returns**: The newly created `Subnet` object.

---

### 2. Entities API (`/api/entities`)

- **`GET /api/entities`**
  - **Returns**: `HomelabEntity[]` list of all tracked entities.

- **`POST /api/entities`**
  - **Body**: `Partial<HomelabEntity>` (with name, type, subnetId, ip, etc.)
  - **Returns**: The newly created `HomelabEntity` object. Automatically creates an active `IPAllocation` if an IP was provided.

- **`PUT /api/entities`**
  - **Body**: `{ id: string, ...updates }`
  - **Returns**: Updated `HomelabEntity` object.

- **`DELETE /api/entities?id={id}`**
  - **Query Param**: `id` - Entity ID to remove.
  - **Returns**: `{ success: true }`.

---

### 3. IPAM API (`/api/ipam`)

- **`GET /api/ipam`**
  - **Returns**: `IPAllocation[]` list of all IP assignments.

- **`POST /api/ipam`**
  - **Body**: `{ subnetId: string, ip: string, hostname: string, mac?: string, status: 'active' | 'reserved', notes?: string }`
  - **Returns**: Updated/created `IPAllocation` object.

- **`DELETE /api/ipam?id={id}`**
  - **Query Param**: `id` - Allocation ID to delete/free.
  - **Returns**: `{ success: true }`.
