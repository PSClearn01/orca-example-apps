<script lang="ts">
  import { Search, Filter, Globe, Server, CheckCircle2, AlertTriangle, Shield, RefreshCw } from '@lucide/svelte';
  import type { Subnet, HomelabEntity, IPAllocation, IPStatus } from '$lib/types';

  let { subnets, entities, allocations, onSelectIPSlot } = $props<{
    subnets: Subnet[];
    entities: HomelabEntity[];
    allocations: IPAllocation[];
    onSelectIPSlot: (subnet: Subnet, octet: number, existingAlloc?: IPAllocation) => void;
  }>();

  let selectedSubnetId = $state(subnets[0]?.id || '');
  let searchQuery = $state('');
  let statusFilter = $state<'all' | 'active' | 'reserved' | 'free'>('all');

  let activeSubnet = $derived(subnets.find((s: Subnet) => s.id === selectedSubnetId) || subnets[0]);

  // Extract base IP prefix e.g. "192.168.1" from "192.168.1.0/24"
  let ipPrefix = $derived.by(() => {
    if (!activeSubnet) return '192.168.1';
    const match = activeSubnet.cidr.match(/^(\d+\.\d+\.\d+)\.\d+\/\d+$/);
    return match ? match[1] : '192.168.1';
  });

  // Map of last octet (0..255) -> IPAllocation object
  let ipMap = $derived.by(() => {
    const map = new Map<number, IPAllocation>();
    const prefix = ipPrefix;
    for (const alloc of allocations) {
      if (alloc.ip.startsWith(prefix + '.')) {
        const lastOctet = parseInt(alloc.ip.split('.')[3], 10);
        if (!isNaN(lastOctet)) {
          map.set(lastOctet, alloc);
        }
      }
    }
    return map;
  });

  function getSlotStatus(octet: number): { status: 'network' | 'broadcast' | 'gateway' | IPStatus; alloc?: IPAllocation } {
    if (octet === 0) return { status: 'network' };
    if (octet === 255) return { status: 'broadcast' };

    const ip = `${ipPrefix}.${octet}`;
    if (ip === activeSubnet?.gateway) {
      const alloc = ipMap.get(octet);
      return { status: 'gateway', alloc };
    }

    const alloc = ipMap.get(octet);
    if (alloc) {
      return { status: alloc.status, alloc };
    }

    return { status: 'free' };
  }

  // Count stats for active subnet
  let activeCount = $derived(Array.from({ length: 254 }, (_, i) => i + 1).filter(i => getSlotStatus(i).status === 'active').length);
  let reservedCount = $derived(Array.from({ length: 254 }, (_, i) => i + 1).filter(i => ['reserved', 'gateway'].includes(getSlotStatus(i).status)).length);
  let freeCount = $derived(254 - activeCount - reservedCount);

  let hoverIP = $state<number | null>(null);
  let hoverInfo = $derived.by(() => {
    if (hoverIP === null) return null;
    const { status, alloc } = getSlotStatus(hoverIP);
    const ip = `${ipPrefix}.${hoverIP}`;
    const entity = alloc?.entityId ? entities.find((e: HomelabEntity) => e.id === alloc.entityId) : null;
    return { ip, status, alloc, entity, octet: hoverIP };
  });
</script>

<div class="ipam-container">
  <!-- Subnet Bar & Controls -->
  <div class="glass-card controls-card">
    <div class="subnet-tabs">
      {#each subnets as sub}
        <button 
          class="subnet-tab-btn {selectedSubnetId === sub.id ? 'active' : ''}"
          onclick={() => selectedSubnetId = sub.id}
        >
          <span class="dot" style="background-color: {sub.color}"></span>
          <span class="sub-name">{sub.name}</span>
          <span class="mono sub-cidr">{sub.cidr}</span>
        </button>
      {/each}
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Filter by IP, Hostname..." 
          bind:value={searchQuery}
          class="input-field search-input" 
        />
      </div>

      <div class="status-filters">
        <button 
          class="filter-pill {statusFilter === 'all' ? 'active' : ''}"
          onclick={() => statusFilter = 'all'}
        >
          All (256)
        </button>
        <button 
          class="filter-pill active-pill {statusFilter === 'active' ? 'active' : ''}"
          onclick={() => statusFilter = 'active'}
        >
          Active ({activeCount})
        </button>
        <button 
          class="filter-pill reserved-pill {statusFilter === 'reserved' ? 'active' : ''}"
          onclick={() => statusFilter = 'reserved'}
        >
          Reserved ({reservedCount})
        </button>
        <button 
          class="filter-pill free-pill {statusFilter === 'free' ? 'active' : ''}"
          onclick={() => statusFilter = 'free'}
        >
          Free ({freeCount})
        </button>
      </div>
    </div>
  </div>

  <!-- Subnet Meta Bar -->
  <div class="glass-card subnet-meta-card">
    <div class="meta-item">
      <span class="meta-label">Subnet Name</span>
      <span class="meta-val font-bold">{activeSubnet?.name}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Gateway IP</span>
      <span class="meta-val mono">{activeSubnet?.gateway}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">VLAN</span>
      <span class="meta-val badge badge-dhcp">VLAN {activeSubnet?.vlan}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">DNS Servers</span>
      <span class="meta-val mono">{activeSubnet?.dnsPrimary} {activeSubnet?.dnsSecondary ? `/ ${activeSubnet.dnsSecondary}` : ''}</span>
    </div>
    <div class="meta-item right">
      <span class="meta-label">Available IPs</span>
      <span class="meta-val emerald-text font-bold">{freeCount} / 254 free</span>
    </div>
  </div>

  <!-- Interactive 256-IP Grid Visualization -->
  <div class="glass-card grid-card">
    <div class="grid-header">
      <h3>Interactive Subnet Map <span class="mono text-muted">({ipPrefix}.0/24)</span></h3>
      <div class="grid-legend">
        <span class="legend-item"><span class="box network"></span> Net/Bcast</span>
        <span class="legend-item"><span class="box gateway"></span> Gateway</span>
        <span class="legend-item"><span class="box active"></span> Active</span>
        <span class="legend-item"><span class="box reserved"></span> Reserved</span>
        <span class="legend-item"><span class="box free"></span> Unassigned</span>
      </div>
    </div>

    <!-- The 256 Slot Grid -->
    <div class="ip-grid">
      {#each Array.from({ length: 256 }, (_, i) => i) as octet}
        {@const slot = getSlotStatus(octet)}
        {@const fullIp = `${ipPrefix}.${octet}`}
        {@const isMatchSearch = !searchQuery || fullIp.includes(searchQuery) || (slot.alloc?.hostname || '').toLowerCase().includes(searchQuery.toLowerCase())}
        {@const isMatchStatus = statusFilter === 'all' || 
          (statusFilter === 'active' && slot.status === 'active') ||
          (statusFilter === 'reserved' && (slot.status === 'reserved' || slot.status === 'gateway')) ||
          (statusFilter === 'free' && slot.status === 'free')}

        <button 
          class="ip-slot status-{slot.status} {!isMatchSearch || !isMatchStatus ? 'dimmed' : ''}"
          onmouseenter={() => hoverIP = octet}
          onmouseleave={() => hoverIP = null}
          onclick={() => {
            if (slot.status !== 'network' && slot.status !== 'broadcast') {
              onSelectIPSlot(activeSubnet, octet, slot.alloc);
            }
          }}
          disabled={slot.status === 'network' || slot.status === 'broadcast'}
          title="{fullIp} - {slot.status}"
        >
          <span class="octet-num mono">.{octet}</span>
        </button>
      {/each}
    </div>

    <!-- Inspector Floating / Details Box -->
    <div class="inspector-box">
      {#if hoverInfo}
        <div class="inspector-content">
          <div class="insp-ip mono">{hoverInfo.ip}</div>
          <div class="insp-status">
            <span class="badge badge-{hoverInfo.status === 'gateway' ? 'reserved' : hoverInfo.status}">
              {hoverInfo.status.toUpperCase()}
            </span>
          </div>
          {#if hoverInfo.alloc?.hostname}
            <div class="insp-hostname font-bold">{hoverInfo.alloc.hostname}</div>
          {/if}
          {#if hoverInfo.entity}
            <div class="insp-entity-type">{hoverInfo.entity.type.toUpperCase()} • {hoverInfo.entity.os || 'Host'}</div>
          {/if}
          {#if hoverInfo.alloc?.mac}
            <div class="insp-mac mono">{hoverInfo.alloc.mac}</div>
          {/if}
          {#if hoverInfo.alloc?.notes}
            <div class="insp-notes">{hoverInfo.alloc.notes}</div>
          {/if}
        </div>
      {:else}
        <div class="inspector-placeholder">
          <span>Hover over any IP slot in the grid to view live allocation details or click to assign.</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .ipam-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .controls-card {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .subnet-tabs {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .subnet-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    font-family: var(--font-main);
  }

  .subnet-tab-btn:hover {
    background: rgba(30, 41, 59, 0.8);
    color: var(--text-primary);
  }

  .subnet-tab-btn.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.4);
    color: var(--text-primary);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .sub-cidr {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0 12px;
    width: 280px;
  }

  .search-input {
    border: none;
    background: transparent;
    padding: 8px 0;
  }

  .search-input:focus {
    box-shadow: none;
  }

  .status-filters {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-pill {
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-pill.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .filter-pill.active-pill.active {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.4);
  }

  .filter-pill.reserved-pill.active {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.4);
  }

  .filter-pill.free-pill.active {
    background: rgba(148, 163, 184, 0.2);
    color: var(--text-primary);
  }

  .subnet-meta-card {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 32px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .meta-item.right {
    margin-left: auto;
    align-items: flex-end;
  }

  .meta-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .meta-val {
    font-size: 0.9375rem;
    color: var(--text-primary);
  }

  .emerald-text { color: #34d399; }
  .font-bold { font-weight: 700; }

  .grid-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .grid-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .grid-header h3 {
    font-size: 1rem;
    font-weight: 700;
  }

  .grid-legend {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .box {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .box.network { background: #334155; }
  .box.gateway { background: #38bdf8; }
  .box.active { background: #10b981; }
  .box.reserved { background: #f59e0b; }
  .box.free { background: rgba(30, 41, 59, 0.7); border: 1px dashed rgba(255, 255, 255, 0.2); }

  /* 256 IP Grid Map */
  .ip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 6px;
    max-height: 480px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .ip-slot {
    height: 38px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    font-family: var(--font-mono);
    position: relative;
  }

  .ip-slot:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .octet-num {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status-network, .status-broadcast {
    background: rgba(30, 41, 59, 0.4);
    color: var(--text-muted);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .status-gateway {
    background: rgba(56, 189, 248, 0.25);
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.5);
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
  }

  .status-active {
    background: rgba(16, 185, 129, 0.25);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.5);
  }

  .status-reserved {
    background: rgba(245, 158, 11, 0.25);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.5);
  }

  .status-dhcp {
    background: rgba(168, 85, 247, 0.25);
    color: #c084fc;
    border-color: rgba(168, 85, 247, 0.5);
  }

  .status-free {
    background: rgba(15, 23, 42, 0.6);
    color: var(--text-muted);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .ip-slot:hover:not(:disabled) {
    transform: scale(1.1);
    z-index: 10;
    border-color: #ffffff;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
  }

  .ip-slot.dimmed {
    opacity: 0.15;
  }

  .inspector-box {
    min-height: 56px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 12px 18px;
    display: flex;
    align-items: center;
  }

  .inspector-placeholder {
    font-size: 0.8125rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .inspector-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 0.875rem;
  }

  .insp-ip {
    font-weight: 700;
    font-size: 1.0625rem;
    color: var(--accent-cyan);
  }

  .insp-hostname {
    color: var(--text-primary);
  }

  .insp-entity-type {
    font-size: 0.75rem;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .insp-mac {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .insp-notes {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    border-left: 2px solid var(--accent-cyan);
    padding-left: 8px;
  }
</style>
