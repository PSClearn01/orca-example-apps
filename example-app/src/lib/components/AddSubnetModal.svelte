<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { Subnet } from '$lib/types';

  let { onClose, onSave } = $props<{
    onClose: () => void;
    onSave: (subnetData: Omit<Subnet, 'id'>) => void;
  }>();

  let name = $state('');
  let cidr = $state('10.0.30.0/24');
  let gateway = $state('10.0.30.1');
  let vlan = $state(30);
  let description = $state('');
  let color = $state('#ec4899');
  let dnsPrimary = $state('192.168.1.53');
  let dnsSecondary = $state('1.1.1.1');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onSave({
      name,
      cidr,
      gateway,
      vlan,
      description,
      color,
      dnsPrimary,
      dnsSecondary
    });
  }
</script>

<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Create New Subnet Pool</h2>
      <button class="close-btn" onclick={onClose}>
        <X size={20} />
      </button>
    </div>

    <form onsubmit={handleSubmit} class="form-body">
      <div class="form-group">
        <label for="sub-name">Subnet Name *</label>
        <input 
          id="sub-name"
          type="text" 
          required 
          placeholder="e.g. DMZ & Public Services" 
          bind:value={name} 
          class="input-field" 
        />
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="sub-cidr">CIDR Block *</label>
          <input 
            id="sub-cidr"
            type="text" 
            required 
            placeholder="10.0.30.0/24" 
            bind:value={cidr} 
            class="input-field mono" 
          />
        </div>

        <div class="form-group">
          <label for="sub-gw">Gateway IP *</label>
          <input 
            id="sub-gw"
            type="text" 
            required 
            placeholder="10.0.30.1" 
            bind:value={gateway} 
            class="input-field mono" 
          />
        </div>

        <div class="form-group">
          <label for="sub-vlan">VLAN Tag</label>
          <input 
            id="sub-vlan"
            type="number" 
            placeholder="30" 
            bind:value={vlan} 
            class="input-field" 
          />
        </div>

        <div class="form-group">
          <label for="sub-color">Theme Tag Color</label>
          <input 
            id="sub-color"
            type="color" 
            bind:value={color} 
            class="input-field color-input" 
          />
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="sub-dns1">Primary DNS</label>
          <input id="sub-dns1" type="text" bind:value={dnsPrimary} class="input-field mono" />
        </div>

        <div class="form-group">
          <label for="sub-dns2">Secondary DNS</label>
          <input id="sub-dns2" type="text" bind:value={dnsSecondary} class="input-field mono" />
        </div>
      </div>

      <div class="form-group">
        <label for="sub-desc">Description</label>
        <textarea id="sub-desc" rows="2" placeholder="Subnet usage scope..." bind:value={description} class="input-field"></textarea>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick={onClose}>Cancel</button>
        <button type="submit" class="btn btn-primary">Create Subnet</button>
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
    gap: 16px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
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

  .color-input {
    height: 42px;
    padding: 4px;
    cursor: pointer;
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
