<script lang="ts">
  import { Search, Filter, Plus, Server, Cpu, HardDrive, Network, Wifi, Activity, Edit3, Trash2, Radio, CheckCircle2, AlertTriangle, XCircle } from '@lucide/svelte';
  import type { HomelabEntity, EntityType, EntityStatus } from '$lib/types';

  let { entities, onEditEntity, onDeleteEntity, onAddEntity, onToggleStatus } = $props<{
    entities: HomelabEntity[];
    onEditEntity: (entity: HomelabEntity) => void;
    onDeleteEntity: (id: string) => void;
    onAddEntity: () => void;
    onToggleStatus: (id: string) => void;
  }>();

  let searchQuery = $state('');
  let typeFilter = $state<string>('all');
  let statusFilter = $state<string>('all');

  let filteredEntities = $derived.by(() => {
    return entities.filter((e: HomelabEntity) => {
      const matchSearch = !searchQuery || 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.ip.includes(searchQuery) ||
        e.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.os || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  });

  function getEntityIcon(type: EntityType) {
    switch (type) {
      case 'hypervisor': return Server;
      case 'vm': return Cpu;
      case 'container': return Activity;
      case 'network': return Network;
      case 'storage': return HardDrive;
      case 'iot': return Wifi;
      default: return Server;
    }
  }
</script>

<div class="entities-container">
  <!-- Controls Bar -->
  <div class="glass-card controls-card">
    <div class="search-and-filters">
      <div class="search-box">
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search entities, IPs, MAC, tags..." 
          bind:value={searchQuery}
          class="input-field search-input" 
        />
      </div>

      <div class="filter-group">
        <select bind:value={typeFilter} class="input-field select-field">
          <option value="all">All Entity Types</option>
          <option value="hypervisor">Hypervisors</option>
          <option value="vm">Virtual Machines</option>
          <option value="container">Containers</option>
          <option value="network">Network Gear</option>
          <option value="storage">Storage / NAS</option>
          <option value="iot">IoT Devices</option>
          <option value="service">Services</option>
        </select>

        <select bind:value={statusFilter} class="input-field select-field">
          <option value="all">All Statuses</option>
          <option value="online">Online</option>
          <option value="warning">Warning</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </div>

    <button class="btn btn-primary" onclick={onAddEntity}>
      <Plus size={16} />
      <span>Add Entity</span>
    </button>
  </div>

  <!-- Table Panel -->
  <div class="glass-card table-panel">
    <div class="table-header-info">
      <h3>Homelab Entity Inventory <span class="badge-count">{filteredEntities.length}</span></h3>
    </div>

    <div class="table-wrapper">
      <table class="entity-table">
        <thead>
          <tr>
            <th>Entity Name & Type</th>
            <th>IP Address</th>
            <th>MAC Address</th>
            <th>Status & Ping</th>
            <th>OS / Platform</th>
            <th>Specs / Location</th>
            <th>Tags</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredEntities as entity}
            {@const Icon = getEntityIcon(entity.type)}
            <tr>
              <td>
                <div class="entity-name-cell">
                  <div class="entity-type-icon {entity.type}">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div class="entity-name font-bold">{entity.name}</div>
                    <div class="entity-type-label">{entity.type.toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td class="mono font-bold cyan-text">{entity.ip}</td>
              <td class="mono muted-text">{entity.mac}</td>
              <td>
                <div class="status-cell">
                  <span class="badge badge-{entity.status}">
                    {#if entity.status === 'online'}<CheckCircle2 size={12} />{:else if entity.status === 'warning'}<AlertTriangle size={12} />{:else}<XCircle size={12} />{/if}
                    {entity.status}
                  </span>
                  <button 
                    class="ping-btn" 
                    onclick={() => onToggleStatus(entity.id)}
                    title="Simulate ping health check"
                  >
                    <Radio size={13} />
                  </button>
                </div>
              </td>
              <td>
                <span class="os-text">{entity.os || 'N/A'}</span>
              </td>
              <td>
                <div class="specs-cell">
                  {#if entity.specs?.cpu}
                    <span class="spec-tag">{entity.specs.cpu}</span>
                  {/if}
                  {#if entity.specs?.ram}
                    <span class="spec-tag">{entity.specs.ram}</span>
                  {/if}
                  {#if entity.location}
                    <span class="location-tag">📍 {entity.location}</span>
                  {/if}
                </div>
              </td>
              <td>
                <div class="tags-cell">
                  {#each entity.tags as tag}
                    <span class="tag-badge">#{tag}</span>
                  {/each}
                </div>
              </td>
              <td class="text-right">
                <div class="actions-cell">
                  <button class="icon-btn edit-btn" onclick={() => onEditEntity(entity)} title="Edit entity">
                    <Edit3 size={15} />
                  </button>
                  <button class="icon-btn delete-btn" onclick={() => onDeleteEntity(entity.id)} title="Delete entity">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="empty-cell">
                No entities found matching your filters.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .entities-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .controls-card {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .search-and-filters {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    flex: 1;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0 12px;
    width: 320px;
  }

  .search-input {
    border: none;
    background: transparent;
    padding: 8px 0;
  }

  .search-input:focus {
    box-shadow: none;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .select-field {
    width: auto;
    padding: 8px 12px;
    cursor: pointer;
  }

  .table-panel {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .table-header-info h3 {
    font-size: 1.0625rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .badge-count {
    background: rgba(56, 189, 248, 0.15);
    color: var(--accent-cyan);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .entity-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    text-align: left;
  }

  .entity-table th {
    padding: 12px 14px;
    background: rgba(15, 23, 42, 0.6);
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border-color);
  }

  .entity-table td {
    padding: 14px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  .entity-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }

  .entity-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .entity-type-icon {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .entity-type-icon.hypervisor { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); }
  .entity-type-icon.vm { background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); }
  .entity-type-icon.container { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
  .entity-type-icon.network { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
  .entity-type-icon.storage { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
  .entity-type-icon.iot { background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); }
  .entity-type-icon.service { background: rgba(148, 163, 184, 0.15); color: var(--text-secondary); }

  .entity-name { font-size: 0.9375rem; }
  .entity-type-label { font-size: 0.6875rem; color: var(--text-muted); font-weight: 600; }

  .cyan-text { color: var(--accent-cyan); }
  .muted-text { color: var(--text-muted); font-size: 0.8125rem; }

  .status-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ping-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;
  }

  .ping-btn:hover {
    color: var(--accent-cyan);
    background: rgba(255, 255, 255, 0.05);
  }

  .os-text { font-size: 0.8125rem; color: var(--text-secondary); }

  .specs-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-width: 220px;
  }

  .spec-tag, .location-tag {
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
  }

  .tags-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-width: 180px;
  }

  .tag-badge {
    font-size: 0.7rem;
    color: var(--accent-purple);
    background: rgba(168, 85, 247, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .text-right { text-align: right; }

  .actions-cell {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    padding: 6px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .edit-btn:hover { background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); }
  .delete-btn:hover { background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); }

  .empty-cell {
    text-align: center;
    padding: 32px;
    color: var(--text-muted);
    font-style: italic;
  }
</style>
