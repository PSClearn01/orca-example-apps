<script lang="ts">
  import { Server, Network, Activity, Cpu, ShieldCheck, Plus, Globe } from '@lucide/svelte';

  let { activeTab, setActiveTab, onOpenAddEntity, onOpenAddSubnet } = $props<{
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenAddEntity: () => void;
    onOpenAddSubnet: () => void;
  }>();
</script>

<header class="header">
  <div class="header-container">
    <div class="brand">
      <div class="logo-icon">
        <Server size={24} color="#38bdf8" />
      </div>
      <div class="brand-text">
        <h1>NetPulse <span class="badge-tag">IPAM & Infra</span></h1>
        <p class="subtitle">Homelab Infrastructure Management System</p>
      </div>
    </div>

    <nav class="nav-tabs">
      <button 
        class="tab-btn {activeTab === 'dashboard' ? 'active' : ''}"
        onclick={() => setActiveTab('dashboard')}
      >
        <Activity size={16} />
        <span>Dashboard</span>
      </button>

      <button 
        class="tab-btn {activeTab === 'ipam' ? 'active' : ''}"
        onclick={() => setActiveTab('ipam')}
      >
        <Network size={16} />
        <span>IPAM Grid</span>
      </button>

      <button 
        class="tab-btn {activeTab === 'entities' ? 'active' : ''}"
        onclick={() => setActiveTab('entities')}
      >
        <Cpu size={16} />
        <span>Entities</span>
      </button>

      <button 
        class="tab-btn {activeTab === 'logs' ? 'active' : ''}"
        onclick={() => setActiveTab('logs')}
      >
        <ShieldCheck size={16} />
        <span>Audit Logs</span>
      </button>
    </nav>

    <div class="header-actions">
      <button class="btn btn-secondary" onclick={onOpenAddSubnet}>
        <Globe size={16} />
        <span>+ Subnet</span>
      </button>
      <button class="btn btn-primary" onclick={onOpenAddEntity}>
        <Plus size={16} />
        <span>New Entity</span>
      </button>
    </div>
  </div>
</header>

<style>
  .header {
    background: rgba(11, 15, 25, 0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.2), rgba(15, 23, 42, 0.8));
    border: 1px solid rgba(56, 189, 248, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
  }

  .brand-text h1 {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.02em;
  }

  .badge-tag {
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(56, 189, 248, 0.15);
    color: var(--accent-cyan);
    border: 1px solid rgba(56, 189, 248, 0.3);
    font-weight: 700;
    text-transform: uppercase;
  }

  .subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .nav-tabs {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(15, 23, 42, 0.6);
    padding: 4px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-main);
  }

  .tab-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .tab-btn.active {
    color: var(--text-primary);
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
