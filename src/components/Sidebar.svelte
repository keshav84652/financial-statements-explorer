<script>
  import { BarChart3, Briefcase, BookOpen, Settings, FileStack, PieChart } from 'lucide-svelte';
  import { currentView } from '../stores/uiStore';
  
  export let open = true;
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'statements', name: 'Financial Statements', icon: FileStack },
    { id: 'transactions', name: 'Transaction Simulator', icon: Briefcase },
    { id: 'ratios', name: 'Financial Ratios', icon: PieChart },
    { id: 'learn', name: 'Learning Center', icon: BookOpen },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];
  
  const setView = (id) => {
    currentView.set(id);
  };
</script>

<aside 
  class="bg-white border-r border-slate-200 transition-all duration-300 flex flex-col"
  class:w-64={open}
  class:w-16={!open}
>
  <nav class="flex-1 p-4">
    <ul class="space-y-2">
      {#each menuItems as item}
        <li>
          <button
            on:click={() => setView(item.id)}
            class="flex items-center p-3 w-full rounded-md hover:bg-slate-100 transition"
            class:justify-center={!open}
            class:justify-start={open}
            class:bg-slate-100={$currentView === item.id}
          >
            <svelte:component this={item.icon} size={20} />
            {#if open}
              <span class="ml-3">{item.name}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
  
  <div class="p-4 border-t border-slate-200">
    <div class="flex items-center">
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
        U
      </div>
      {#if open}
        <div class="ml-3">
          <div class="text-sm font-medium">User Account</div>
          <div class="text-xs text-slate-500">Demo Mode</div>
        </div>
      {/if}
    </div>
  </div>
</aside>