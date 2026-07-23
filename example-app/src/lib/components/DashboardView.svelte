<script lang="ts">
  import { Server, Network, Cpu, HardDrive, Shield, Activity, Wifi, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from '@lucide/svelte';
  import type { Subnet, HomelabEntity, IPAllocation, ActivityLog } from '$lib/types';

  let { subnets, entities, allocations, logs, onNavigateTab } = $props<{
    subnets: Subnet[];
    entities: HomelabEntity[];
    allocations: IPAllocation[];
    logs: ActivityLog[];
    onNavigateTab: (tab: string) => void;
  }>();

  let totalIPCapacity = $derived(subnets.length * 254);
  let activeIPCount = $derived(allocations.filter((a: IPAllocation) => a.status === 'active').length);
  let reservedIPCount = $derived(allocations.filter((a: IPAllocation) => a.status === 'reserved').length);
  let utilizationPct = $derived(totalIPCapacity > 0 ? Math.round(((activeIPCount + reservedIPCount) / totalIPCapacity) * 100) : 0);

  let onlineEntities = $derived(entities.filter((e: HomelabEntity) => e.status === 'online').length);
  let warningEntities = $derived(entities.filter((e: HomelabEntity) => e.status === 'warning').length);
  let offlineEntities = $derived(entities.filter((e: HomelabEntity) => e.status === 'offline').length);

  let entityTypesCount = $derived({
    hypervisor: entities.filter((e: HomelabEntity) => e.type === 'hypervisor').length,
    vm: entities.filter((e: HomelabEntity) => e.type === 'vm').length,
    container: entities.filter((e: HomelabEntity) => e.type === 'container').length,
    network: entities.filter((e: HomelabEntity) => e.type === 'network').length,
    storage: entities.filter((e: HomelabEntity) => e.type === 'storage').length,
    iot: entities.filter((e: HomelabEntity) => e.type === 'iot').length,
    service: entities.filter((e: HomelabEntity) => e.type === 'service').length,
  });
</script>

<div class="dashboard-container">
  <!-- Stats Summary Grid -->
  <div class="stats-grid">
    <div class="glass-card stat-card">
      <div class="stat-header">
        <span class="stat-title">Subnets & Networks</span>
        <div class="icon-wrapper cyan">
          <Network size={20} />
        </div>
      </div>
      <div class="stat-value">{subnets.length}</div>
      <div class="stat-sub">
        <span>Active Subnets across {subnets.length} VLANs</span>
      </div>
    </div>

    <div class="glass-card stat-card">
      <div class="stat-header">
        <span class="stat-title">IP Pool Utilization</span>
        <div class="icon-wrapper emerald">
          <Activity size={20} />
        </div>
      </div>
      <div class="stat-value">{activeIPCount + reservedIPCount} <span class="unit">/ {totalIPCapacity} IPs</span></div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: {utilizationPct}%"></div>
      </div>
      <div class="stat-sub">
        <span>{utilizationPct}% Allocated ({activeIPCount} Active, {reservedIPCount} Reserved)</span>
      </div>
    </div>

    <div class="glass-card stat-card">
      <div class="stat-header">
        <span class="stat-title">Infrastructure Entities</span>
        <div class="icon-wrapper purple">
          <Server size={20} />
        </div>
      </div>
      <div class="stat-value">{entities.length}</div>
      <div class="stat-sub entity-status-tags">
        <span class="status-pill online"><CheckCircle2 size={12} /> {onlineEntities} Online</span>
        {#if warningEntities > 0}
          <span class="status-pill warning"><AlertTriangle size={12} /> {warningEntities} Warn</span>
        {/if}
        {#if offlineEntities > 0}
          <span class="status-pill offline"><XCircle size={12} /> {offlineEntities} Down</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Section: Subnet Overview & Entity Breakdown -->
  <div class="grid-2-col">
    <!-- Subnets Quick Overview -->
    <div class="glass-card panel">
      <div class="panel-header">
        <h2>Subnet IP Pools</h2>
        <button class="link-btn" onclick={() => onNavigateTab('ipam')}>
          View IPAM Grid <ArrowUpRight size={16} />
        </button>
      </div>

      <div class="subnet-list">
        {#each subnets as sub}
          {@const subAllocCount = allocations.filter((a: IPAllocation) => a.subnetId === sub.id).length}
          {@const pct = Math.round((subAllocCount / 254) * 100)}
          <div class="subnet-item">
            <div class="subnet-info">
              <div class="subnet-color-bar" style="background-color: {sub.color}"></div>
              <div>
                <div class="subnet-name">{sub.name} <span class="mono subnet-cidr">{sub.cidr}</span></div>
                <div class="subnet-meta">VLAN {sub.vlan} • GW: {sub.gateway}</div>
              </div>
            </div>
            <div class="subnet-usage">
              <div class="usage-text mono">{subAllocCount} / 254 ({pct}%)</div>
              <div class="mini-bar-bg">
                <div class="mini-bar-fill" style="width: {pct}%; background-color: {sub.color}"></div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Entity Composition -->
    <div class="glass-card panel">
      <div class="panel-header">
        <h2>Infrastructure Composition</h2>
        <button class="link-btn" onclick={() => onNavigateTab('entities')}>
          Manage Entities <ArrowUpRight size={16} />
        </button>
      </div>

      <div class="composition-grid">
        <div class="comp-box">
          <div class="comp-icon purple"><Server size={18} /></div>
          <div class="comp-details">
            <span class="comp-num">{entityTypesCount.hypervisor}</span>
            <span class="comp-label">Hypervisors</span>
          </div>
        </div>

        <div class="comp-box">
          <div class="comp-icon cyan"><Cpu size={18} /></div>
          <div class="comp-details">
            <span class="comp-num">{entityTypesCount.vm}</span>
            <span class="comp-label">Virtual Machines</span>
          </div>
        </div>

        <div class="comp-box">
          <div class="comp-icon emerald"><Activity size={18} /></div>
          <div class="comp-details">
            <span class="comp-num">{entityTypesCount.container}</span>
            <span class="comp-label">Containers</span>
          </div>
        </div>

        <div class="comp-box">
          <div class="comp-icon amber"><Network size={18} /></div>
          <div class="comp-details">
            <span class="comp-num">{entityTypesCount.network}</span>
            <span class="comp-label">Networking Gear</span>
          </div>
        </div>

        <div class="comp-box">
          <div class="comp-icon blue"><HardDrive size={18} /></div>
          <div class="comp-details">
            <span class="comp-num">{entityTypesCount.storage}</span>
            <span class="comp-label">Storage / NAS</span>
          </div>
        </div>

        <div class="comp-box">
          <div class="comp-icon rose"><Wifi size={18} /></div>
          <div class="comp-details">
            <span class="comp-num">{entityTypesCount.iot}</span>
            <span class="comp-label">IoT Devices</span>
          </div>
        </div>
      </div>

      <div class="recent-alerts">
        <h3>Recent System Activity</h3>
        <ul class="activity-mini-list">
          {#each logs.slice(0, 3) as log}
            <li class="log-mini-item">
              <span class="log-dot {log.type}"></span>
              <span class="log-action">{log.action}:</span>
              <span class="log-details">{log.details}</span>
              <span class="log-time mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .stat-card {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .icon-wrapper {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-wrapper.cyan { background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); }
  .icon-wrapper.emerald { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
  .icon-wrapper.purple { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .stat-value .unit {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .progress-bar-container {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #38bdf8);
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .stat-sub {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .entity-status-tags {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status-pill.online { background: rgba(16, 185, 129, 0.15); color: #34d399; }
  .status-pill.warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
  .status-pill.offline { background: rgba(244, 63, 94, 0.15); color: #fb7185; }

  .grid-2-col {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    gap: 24px;
  }

  .panel {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-header h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .link-btn {
    background: transparent;
    border: none;
    color: var(--accent-cyan);
    font-size: 0.8125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .subnet-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .subnet-item {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .subnet-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .subnet-color-bar {
    width: 4px;
    height: 36px;
    border-radius: 2px;
  }

  .subnet-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .subnet-cidr {
    font-size: 0.8125rem;
    color: var(--accent-cyan);
    margin-left: 6px;
  }

  .subnet-meta {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .subnet-usage {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    width: 140px;
  }

  .usage-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .mini-bar-bg {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
  }

  .mini-bar-fill {
    height: 100%;
    border-radius: 999px;
  }

  .composition-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .comp-box {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .comp-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .comp-icon.purple { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); }
  .comp-icon.cyan { background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); }
  .comp-icon.emerald { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
  .comp-icon.amber { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
  .comp-icon.blue { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }
  .comp-icon.rose { background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); }

  .comp-details {
    display: flex;
    flex-direction: column;
  }

  .comp-num {
    font-size: 1.125rem;
    font-weight: 800;
    line-height: 1;
  }

  .comp-label {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .recent-alerts {
    margin-top: 8px;
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
  }

  .recent-alerts h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .activity-mini-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .log-mini-item {
    font-size: 0.8125rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .log-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .log-dot.success { background: var(--accent-emerald); }
  .log-dot.warning { background: var(--accent-amber); }
  .log-dot.info { background: var(--accent-cyan); }

  .log-action {
    font-weight: 600;
    color: var(--text-primary);
  }

  .log-details {
    color: var(--text-secondary);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .log-time {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
</style>
