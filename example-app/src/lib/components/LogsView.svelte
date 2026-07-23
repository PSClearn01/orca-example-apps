<script lang="ts">
  import { ShieldCheck, Search, Info, CheckCircle2, AlertTriangle, XCircle } from '@lucide/svelte';
  import type { ActivityLog } from '$lib/types';

  let { logs } = $props<{ logs: ActivityLog[] }>();

  let searchQuery = $state('');

  let filteredLogs = $derived.by(() => {
    return logs.filter((l: ActivityLog) => 
      !searchQuery || 
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
</script>

<div class="logs-container">
  <div class="glass-card controls-card">
    <div class="header-title">
      <ShieldCheck size={20} color="var(--accent-cyan)" />
      <h2>Audit & Change Logs</h2>
    </div>

    <div class="search-box">
      <Search size={16} color="var(--text-muted)" />
      <input 
        type="text" 
        placeholder="Filter logs..." 
        bind:value={searchQuery}
        class="input-field search-input" 
      />
    </div>
  </div>

  <div class="glass-card logs-card">
    <div class="logs-list">
      {#each filteredLogs as log}
        <div class="log-item {log.type}">
          <div class="log-icon">
            {#if log.type === 'success'}
              <CheckCircle2 size={16} color="#34d399" />
            {:else if log.type === 'warning'}
              <AlertTriangle size={16} color="#fbbf24" />
            {:else if log.type === 'danger'}
              <XCircle size={16} color="#fb7185" />
            {:else}
              <Info size={16} color="#38bdf8" />
            {/if}
          </div>

          <div class="log-body">
            <div class="log-head">
              <span class="log-action font-bold">{log.action}</span>
              <span class="log-time mono">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <p class="log-details">{log.details}</p>
          </div>
        </div>
      {:else}
        <div class="empty-logs">No activity log entries found.</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .logs-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .controls-card {
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title h2 {
    font-size: 1.125rem;
    font-weight: 700;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0 12px;
    width: 300px;
  }

  .search-input {
    border: none;
    background: transparent;
    padding: 8px 0;
  }

  .search-input:focus { box-shadow: none; }

  .logs-card {
    padding: 20px 24px;
  }

  .logs-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .log-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    transition: background 0.2s ease;
  }

  .log-item:hover {
    background: rgba(30, 41, 59, 0.5);
  }

  .log-icon {
    margin-top: 2px;
  }

  .log-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .log-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .log-action {
    font-size: 0.9375rem;
    color: var(--text-primary);
  }

  .log-time {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .log-details {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .empty-logs {
    text-align: center;
    padding: 32px;
    color: var(--text-muted);
    font-style: italic;
  }
</style>
