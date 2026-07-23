<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { Subnet, IPAllocation, IPStatus } from '$lib/types';

  let { subnet, octet, existingAlloc, onClose, onSave } = $props<{
    subnet: Subnet;
    octet: number;
    existingAlloc?: IPAllocation;
    onClose: () => void;
    onSave: (allocData: Partial<IPAllocation>) => void;
  }>();

  let prefix = $derived.by(() => {
    const match = subnet.cidr.match(/^(\d+\.\d+\.\d+)/);
    return match ? match[1] : '192.168.1';
  });

  let ip = $derived(`${prefix}.${octet}`);

  let hostname = $state(existingAlloc?.hostname || '');
  let status = $state<IPStatus>(existingAlloc?.status || 'active');
  let mac = $state(existingAlloc?.mac || '');
  let notes = $state(existingAlloc?.notes || '');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onSave({
      subnetId: subnet.id,
      ip,
      hostname,
      status,
      mac,
      notes
    });
  }
</script>

<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <div>
        <h2>IP Allocation: <span class="mono cyan-text">{ip}</span></h2>
        <p class="subtitle">Subnet: {subnet.name} ({subnet.cidr})</p>
      </div>
      <button class="close-btn" onclick={onClose}>
        <X size={20} />
      </button>
    </div>

    <form onsubmit={handleSubmit} class="form-body">
      <div class="form-group">
        <label for="ip-status">IP Status *</label>
        <select id="ip-status" bind:value={status} class="input-field">
          <option value="active">Active (Assigned to Host)</option>
          <option value="reserved">Reserved (Static IP Reservation)</option>
          <option value="dhcp">DHCP Pool Range</option>
          <option value="free">Free / Unassigned</option>
        </select>
      </div>

      <div class="form-group">
        <label for="ip-host">Hostname / Service Name</label>
        <input 
          id="ip-host"
          type="text" 
          placeholder="e.g. k8s-worker-02" 
          bind:value={hostname} 
          class="input-field" 
        />
      </div>

      <div class="form-group">
        <label for="ip-mac">MAC Address</label>
        <input 
          id="ip-mac"
          type="text" 
          placeholder="AA:BB:CC:DD:EE:FF" 
          bind:value={mac} 
          class="input-field mono" 
        />
      </div>

      <div class="form-group">
        <label for="ip-notes">Notes / Details</label>
        <textarea id="ip-notes" rows="3" placeholder="Reserved for upcoming storage expansion..." bind:value={notes} class="input-field"></textarea>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick={onClose}>Cancel</button>
        <button type="submit" class="btn btn-primary">Save Allocation</button>
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

  .subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
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
    gap: 16px;
  }

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

  .cyan-text { color: var(--accent-cyan); }

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
