<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { HomelabEntity, EntityType, Subnet, EntityStatus } from '$lib/types';

  let { initialEntity, subnets, onClose, onSave } = $props<{
    initialEntity?: Partial<HomelabEntity> | null;
    subnets: Subnet[];
    onClose: () => void;
    onSave: (entityData: any) => void;
  }>();

  let name = $state(initialEntity?.name || '');
  let type = $state<EntityType>(initialEntity?.type || 'vm');
  let subnetId = $state(initialEntity?.subnetId || subnets[0]?.id || '');
  let ip = $state(initialEntity?.ip || '');
  let mac = $state(initialEntity?.mac || '52:54:00:' + Array.from({length:3}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(':'));
  let status = $state<EntityStatus>(initialEntity?.status || 'online');
  let os = $state(initialEntity?.os || '');
  let cpu = $state(initialEntity?.specs?.cpu || '');
  let ram = $state(initialEntity?.specs?.ram || '');
  let disk = $state(initialEntity?.specs?.disk || '');
  let location = $state(initialEntity?.location || '');
  let tagsInput = $state(initialEntity?.tags ? initialEntity.tags.join(', ') : 'Lab');
  let notes = $state(initialEntity?.notes || '');

  // Auto-fill IP prefix if changing subnet
  $effect(() => {
    const selectedSub = subnets.find((s: Subnet) => s.id === subnetId);
    if (selectedSub && !ip) {
      const match = selectedSub.cidr.match(/^(\d+\.\d+\.\d+)/);
      if (match) {
        ip = `${match[1]}.`;
      }
    }
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);
    const selectedSub = subnets.find((s: Subnet) => s.id === subnetId);

    onSave({
      id: initialEntity?.id,
      name,
      type,
      subnetId,
      vlan: selectedSub?.vlan || 1,
      ip,
      mac,
      status,
      os,
      specs: { cpu, ram, disk },
      location,
      tags,
      notes
    });
  }
</script>

<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>{initialEntity?.id ? 'Edit Entity' : 'Add Homelab Entity'}</h2>
      <button class="close-btn" onclick={onClose}>
        <X size={20} />
      </button>
    </div>

    <form onsubmit={handleSubmit} class="form-body">
      <div class="form-grid">
        <div class="form-group span-2">
          <label for="ent-name">Entity Hostname / Name *</label>
          <input 
            id="ent-name"
            type="text" 
            required 
            placeholder="e.g. proxmox-node-03" 
            bind:value={name} 
            class="input-field" 
          />
        </div>

        <div class="form-group">
          <label for="ent-type">Type *</label>
          <select id="ent-type" bind:value={type} class="input-field">
            <option value="hypervisor">Hypervisor Host</option>
            <option value="vm">Virtual Machine</option>
            <option value="container">Docker / LXC Container</option>
            <option value="network">Network Hardware (Switch/Router)</option>
            <option value="storage">Storage / NAS</option>
            <option value="iot">Smart Home / IoT</option>
            <option value="service">Service / VIP</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ent-status">Status *</label>
          <select id="ent-status" bind:value={status} class="input-field">
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ent-subnet">Subnet *</label>
          <select id="ent-subnet" bind:value={subnetId} class="input-field">
            {#each subnets as sub}
              <option value={sub.id}>{sub.name} ({sub.cidr})</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="ent-ip">IP Address *</label>
          <input 
            id="ent-ip"
            type="text" 
            required 
            placeholder="e.g. 192.168.1.50" 
            bind:value={ip} 
            class="input-field mono" 
          />
        </div>

        <div class="form-group">
          <label for="ent-mac">MAC Address</label>
          <input 
            id="ent-mac"
            type="text" 
            placeholder="52:54:00:11:22:33" 
            bind:value={mac} 
            class="input-field mono" 
          />
        </div>

        <div class="form-group">
          <label for="ent-os">OS / Distribution</label>
          <input 
            id="ent-os"
            type="text" 
            placeholder="e.g. Debian 12, Proxmox VE, Alpine" 
            bind:value={os} 
            class="input-field" 
          />
        </div>

        <div class="form-group">
          <label for="ent-cpu">CPU Spec</label>
          <input id="ent-cpu" type="text" placeholder="e.g. 4 vCPU / Ryzen 9" bind:value={cpu} class="input-field" />
        </div>

        <div class="form-group">
          <label for="ent-ram">RAM Spec</label>
          <input id="ent-ram" type="text" placeholder="e.g. 16GB ECC" bind:value={ram} class="input-field" />
        </div>

        <div class="form-group">
          <label for="ent-disk">Disk Spec</label>
          <input id="ent-disk" type="text" placeholder="e.g. 100GB NVMe" bind:value={disk} class="input-field" />
        </div>

        <div class="form-group">
          <label for="ent-loc">Location / Rack</label>
          <input id="ent-loc" type="text" placeholder="e.g. Rack U4 or pve-node-01" bind:value={location} class="input-field" />
        </div>

        <div class="form-group span-2">
          <label for="ent-tags">Tags (comma separated)</label>
          <input id="ent-tags" type="text" placeholder="K8s, Prod, Database, Media" bind:value={tagsInput} class="input-field" />
        </div>

        <div class="form-group span-2">
          <label for="ent-notes">Notes / Purpose</label>
          <textarea id="ent-notes" rows="2" placeholder="Entity details or credentials notes..." bind:value={notes} class="input-field"></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick={onClose}>Cancel</button>
        <button type="submit" class="btn btn-primary">
          {initialEntity?.id ? 'Update Entity' : 'Save Entity'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 800;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
  }

  .close-btn:hover { color: var(--text-primary); }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .span-2 { grid-column: span 2; }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  textarea.input-field {
    resize: vertical;
    font-family: var(--font-main);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
  }
</style>
