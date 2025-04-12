<script>
  import { ArrowUpRight, ArrowDownRight } from 'lucide-svelte';
  
  export let title = "Metric";
  export let value = "$0";
  export let change = "0%";
  export let trend = "neutral"; // up, down, or neutral
  export let icon = null;
  export let color = "bg-blue-500"; // bg-blue-500, bg-green-500, etc.
</script>

<div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
  <div class="flex justify-between">
    <div>
      <h3 class="text-sm font-medium text-slate-500">{title}</h3>
      <div class="mt-2 flex items-baseline">
        <div class="text-2xl font-semibold">{value}</div>
        <div 
          class="ml-2 flex items-center text-sm"
          class:text-green-600={trend === 'up'}
          class:text-red-600={trend === 'down'}
          class:text-slate-500={trend === 'neutral'}
        >
          {#if trend === 'up'}
            <ArrowUpRight size={16} />
          {:else if trend === 'down'}
            <ArrowDownRight size={16} />
          {/if}
          {change}
        </div>
      </div>
    </div>
    
    {#if icon}
      <div class="rounded-md p-2 {color} bg-opacity-10">
        <svelte:component this={icon} class="text-{color.replace('bg-', '')}" size={24} />
      </div>
    {/if}
  </div>
</div>