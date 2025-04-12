<script>
  import Navbar from './components/Navbar.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import MainContent from './components/MainContent.svelte';
  import { financialData } from './stores/financialStore';
  import { onMount } from 'svelte';

  let sidebarOpen = true;
  
  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };

  onMount(() => {
    // Initialize with default data
    financialData.initialize();
  });
</script>

<div class="flex flex-col h-screen overflow-hidden">
  <Navbar {toggleSidebar} />
  
  <div class="flex flex-1 overflow-hidden">
    <Sidebar open={sidebarOpen} />
    <MainContent sidebarOpen={sidebarOpen} />
  </div>
</div>

<style>
  :global(html, body) {
    height: 100%;
    overflow: hidden;
  }
</style>