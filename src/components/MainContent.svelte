<script>
  import { currentView } from '../stores/uiStore';
  import Dashboard from './views/Dashboard.svelte';
  import FinancialStatements from './views/FinancialStatements.svelte';
  import TransactionSimulator from './views/TransactionSimulator.svelte';
  import FinancialRatios from './views/FinancialRatios.svelte';
  import LearningCenter from './views/LearningCenter.svelte';
  import Settings from './views/Settings.svelte';
  
  export let sidebarOpen;
</script>

<main 
  class="flex-1 overflow-y-auto p-6 bg-slate-50"
  class:ml-0={!sidebarOpen}
>
  {#if $currentView === 'dashboard'}
    <Dashboard />
  {:else if $currentView === 'statements'}
    <FinancialStatements />
  {:else if $currentView === 'transactions'}
    <TransactionSimulator />
  {:else if $currentView === 'ratios'}
    <FinancialRatios />
  {:else if $currentView === 'learn'}
    <LearningCenter />
  {:else if $currentView === 'settings'}
    <Settings />
  {/if}
</main>