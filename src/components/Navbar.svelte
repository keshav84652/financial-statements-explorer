<script>
  import { Menu, Info, Github } from 'lucide-svelte';
  export let toggleSidebar;
</script>

<header class="bg-white border-b border-slate-200 shadow-sm py-3 px-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <button 
        on:click={toggleSidebar}
        class="p-1 rounded-md hover:bg-slate-100"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>
      
      <div class="flex items-center">
        <div class="w-8 h-8 mr-2 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        </div>
        <h1 class="text-xl font-semibold">Financial Statements Explorer</h1>
      </div>
    </div>
    
    <div class="flex items-center space-x-2">
      <button class="p-2 rounded-md hover:bg-slate-100" aria-label="Help">
        <Info size={20} />
      </button>
      <a 
        href="https://github.com/keshav84652/financial-statements-explorer" 
        target="_blank" 
        rel="noopener noreferrer"
        class="p-2 rounded-md hover:bg-slate-100"
        aria-label="GitHub repository"
      >
        <Github size={20} />
      </a>
    </div>
  </div>
</header>