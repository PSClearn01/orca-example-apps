<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DashboardView from '$lib/components/DashboardView.svelte';
  import IPAMView from '$lib/components/IPAMView.svelte';
  import EntitiesView from '$lib/components/EntitiesView.svelte';
  import LogsView from '$lib/components/LogsView.svelte';
  import AddEntityModal from '$lib/components/AddEntityModal.svelte';
  import IPSlotModal from '$lib/components/IPSlotModal.svelte';
  import AddSubnetModal from '$lib/components/AddSubnetModal.svelte';

  import type { Subnet, HomelabEntity, IPAllocation, ActivityLog } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Reactive state initialized with server data
  let subnets = $state<Subnet[]>(data.subnets || []);
  let entities = $state<HomelabEntity[]>(data.entities || []);
  let allocations = $state<IPAllocation[]>(data.allocations || []);
  let logs = $state<ActivityLog[]>(data.logs || []);

  let activeTab = $state('dashboard');

  // Modal States
  let isAddEntityOpen = $state(false);
  let editingEntity = $state<Partial<HomelabEntity> | null>(null);

  let isAddSubnetOpen = $state(false);

  let ipSlotModalData = $state<{
    subnet: Subnet;
    octet: number;
    existingAlloc?: IPAllocation;
  } | null>(null);

  // Notification Toast
  let toastMsg = $state<string | null>(null);

  function showToast(msg: string) {
    toastMsg = msg;
    setTimeout(() => {
      if (toastMsg === msg) toastMsg = null;
    }, 3500);
  }

  // Action Handlers for Entity CRUD
  async function handleSaveEntity(entityData: any) {
    try {
      const isEdit = Boolean(entityData.id);
      const res = await fetch('/api/entities', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save entity');
      }

      const savedEntity: HomelabEntity = await res.json();

      if (isEdit) {
        entities = entities.map(e => e.id === savedEntity.id ? savedEntity : e);
        // also update matching allocation in state
        const allocIdx = allocations.findIndex(a => a.entityId === savedEntity.id || a.ip === savedEntity.ip);
        if (allocIdx >= 0) {
          allocations[allocIdx] = {
            ...allocations[allocIdx],
            ip: savedEntity.ip,
            hostname: savedEntity.name,
            mac: savedEntity.mac
          };
        }
        showToast(`Updated entity ${savedEntity.name}`);
      } else {
        entities = [savedEntity, ...entities];
        allocations = [
          ...allocations,
          {
            id: `alloc-${savedEntity.ip.replace(/\./g, '-')}`,
            subnetId: savedEntity.subnetId,
            ip: savedEntity.ip,
            hostname: savedEntity.name,
            entityId: savedEntity.id,
            status: 'active',
            mac: savedEntity.mac,
            updatedAt: new Date().toISOString()
          }
        ];
        showToast(`Created new entity ${savedEntity.name} (${savedEntity.ip})`);
      }

      logs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: isEdit ? 'Entity Updated' : 'Entity Created',
          details: `${isEdit ? 'Updated' : 'Added'} ${savedEntity.name} (${savedEntity.ip})`,
          type: 'success'
        },
        ...logs
      ];

      isAddEntityOpen = false;
      editingEntity = null;
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  async function handleDeleteEntity(id: string) {
    const ent = entities.find(e => e.id === id);
    if (!ent) return;
    if (!confirm(`Are you sure you want to delete ${ent.name} (${ent.ip})?`)) return;

    try {
      const res = await fetch(`/api/entities?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete entity');

      entities = entities.filter(e => e.id !== id);
      allocations = allocations.filter(a => a.entityId !== id && a.ip !== ent.ip);

      logs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Entity Deleted',
          details: `Removed ${ent.name} (${ent.ip})`,
          type: 'warning'
        },
        ...logs
      ];

      showToast(`Deleted ${ent.name}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  async function handleToggleStatus(id: string) {
    const ent = entities.find(e => e.id === id);
    if (!ent) return;

    const nextStatus = ent.status === 'online' ? 'warning' : ent.status === 'warning' ? 'offline' : 'online';
    
    try {
      const res = await fetch('/api/entities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      });

      if (res.ok) {
        entities = entities.map(e => e.id === id ? { ...e, status: nextStatus } : e);
        showToast(`Health ping status for ${ent.name} changed to ${nextStatus.toUpperCase()}`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Action Handlers for IPAM Allocation
  async function handleSaveIPAllocation(allocData: Partial<IPAllocation>) {
    try {
      const res = await fetch('/api/ipam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocData)
      });

      if (!res.ok) throw new Error('Failed to update IP allocation');

      const updatedAlloc: IPAllocation = await res.json();
      const existingIdx = allocations.findIndex(a => a.ip === updatedAlloc.ip);

      if (existingIdx >= 0) {
        allocations[existingIdx] = updatedAlloc;
      } else {
        allocations = [...allocations, updatedAlloc];
      }

      logs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'IP Allocation Saved',
          details: `Updated ${updatedAlloc.ip} status to ${updatedAlloc.status.toUpperCase()} (${updatedAlloc.hostname || 'Unassigned'})`,
          type: 'info'
        },
        ...logs
      ];

      showToast(`Saved IP allocation for ${updatedAlloc.ip}`);
      ipSlotModalData = null;
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }

  // Action Handler for Subnet creation
  async function handleSaveSubnet(subnetData: Omit<Subnet, 'id'>) {
    try {
      const res = await fetch('/api/subnets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subnetData)
      });

      if (!res.ok) throw new Error('Failed to create subnet');

      const newSubnet: Subnet = await res.json();
      subnets = [...subnets, newSubnet];

      logs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Subnet Created',
          details: `Created new subnet pool ${newSubnet.cidr} (${newSubnet.name})`,
          type: 'success'
        },
        ...logs
      ];

      showToast(`Subnet ${newSubnet.name} created!`);
      isAddSubnetOpen = false;
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  }
</script>

<svelte:head>
  <title>NetPulse IPAM & Homelab Infra Manager</title>
  <meta name="description" content="Supercharged Homelab Infrastructure & IP Address Management (IPAM) Dashboard" />
</svelte:head>

<Navbar 
  {activeTab} 
  setActiveTab={(tab) => activeTab = tab}
  onOpenAddEntity={() => { editingEntity = null; isAddEntityOpen = true; }}
  onOpenAddSubnet={() => isAddSubnetOpen = true}
/>

<main class="app-main">
  <div class="app-container">
    {#if activeTab === 'dashboard'}
      <DashboardView 
        {subnets} 
        {entities} 
        {allocations} 
        {logs} 
        onNavigateTab={(tab) => activeTab = tab}
      />
    {:else if activeTab === 'ipam'}
      <IPAMView 
        {subnets} 
        {entities} 
        {allocations} 
        onSelectIPSlot={(subnet, octet, existingAlloc) => {
          ipSlotModalData = { subnet, octet, existingAlloc };
        }}
      />
    {:else if activeTab === 'entities'}
      <EntitiesView 
        {entities} 
        onAddEntity={() => { editingEntity = null; isAddEntityOpen = true; }}
        onEditEntity={(ent) => { editingEntity = ent; isAddEntityOpen = true; }}
        onDeleteEntity={handleDeleteEntity}
        onToggleStatus={handleToggleStatus}
      />
    {:else if activeTab === 'logs'}
      <LogsView {logs} />
    {/if}
  </div>
</main>

<!-- Modals -->
{#if isAddEntityOpen}
  <AddEntityModal 
    initialEntity={editingEntity}
    {subnets}
    onClose={() => { isAddEntityOpen = false; editingEntity = null; }}
    onSave={handleSaveEntity}
  />
{/if}

{#if ipSlotModalData}
  <IPSlotModal 
    subnet={ipSlotModalData.subnet}
    octet={ipSlotModalData.octet}
    existingAlloc={ipSlotModalData.existingAlloc}
    onClose={() => ipSlotModalData = null}
    onSave={handleSaveIPAllocation}
  />
{/if}

{#if isAddSubnetOpen}
  <AddSubnetModal 
    onClose={() => isAddSubnetOpen = false}
    onSave={handleSaveSubnet}
  />
{/if}

<!-- Toast Notification -->
{#if toastMsg}
  <div class="toast-notification">
    <span>✨ {toastMsg}</span>
  </div>
{/if}

<style>
  .app-main {
    flex: 1;
    padding: 32px 24px 64px 24px;
  }

  .app-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .toast-notification {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f172a;
    border: 1px solid var(--accent-cyan);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 200;
    animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
