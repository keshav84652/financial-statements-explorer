<script>
  import { settings } from '../../stores/uiStore';
  
  export let data = {};
  export let title = '';
  export let description = '';
  export let level = 0; // Nesting level for indentation
  export let totalLabel = 'Total';
  export let isTotal = false;
  export let isNegative = false; // Whether the value should be displayed as negative (e.g., expenses)
  export let editable = false; // Whether the values can be edited
  export let onChange = () => {}; // Callback for when a value changes
  
  // Format currency values
  const formatCurrency = (value) => {
    // Determine sign for display
    const displayValue = isNegative ? -value : value;
    
    // Format with user's preferred currency symbol and decimal places
    return `${$settings.currencySymbol}${Math.abs(displayValue).toLocaleString('en-US', {
      minimumFractionDigits: $settings.decimalPlaces,
      maximumFractionDigits: $settings.decimalPlaces
    })}`;
  };
  
  // Handle value change for editable fields
  const handleChange = (key, event) => {
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      onChange(key, isNegative ? -newValue : newValue);
    }
  };
  
  // Determine if the object has nested objects or is a leaf node
  const isLeaf = (obj) => {
    return typeof obj === 'number' || obj === null || obj === undefined;
  };
  
  // Calculate background class based on nesting level
  const getBgClass = (level, isTotal = false) => {
    if (isTotal) return 'bg-slate-50';
    if (level === 0) return 'bg-white';
    return level % 2 === 1 ? 'bg-slate-50/50' : 'bg-white';
  };
  
  // Calculate the padding left based on nesting level
  const getPaddingClass = (level) => {
    return `pl-${4 + level * 4}`;
  };
</script>

<div class="mb-4">
  {#if title}
    <h3 class="text-lg font-semibold mb-2 text-slate-700">{title}</h3>
  {/if}
  
  {#if description}
    <p class="text-sm text-slate-500 mb-3">{description}</p>
  {/if}
  
  <div class="overflow-x-auto">
    <table class="statement-table">
      <!-- Table headers for editable mode -->
      {#if editable}
        <thead>
          <tr>
            <th>Account</th>
            <th class="text-right">Value</th>
          </tr>
        </thead>
      {/if}
      
      <tbody>
        {#if isLeaf(data)}
          <!-- Single value, not an object -->
          <tr class={isTotal ? 'total' : ''}>
            <td class={getPaddingClass(level)}>{title}</td>
            <td class="text-right">
              {#if editable}
                <input 
                  type="number"
                  class="number-input w-32"
                  value={isNegative ? -data : data}
                  on:change={(e) => handleChange(title, e)}
                />
              {:else}
                <span class={isNegative && data > 0 ? 'text-red-600' : ''}>
                  {formatCurrency(data)}
                </span>
              {/if}
            </td>
          </tr>
        {:else if data !== null && typeof data === 'object'}
          <!-- Object with nested properties -->
          {#each Object.entries(data) as [key, value]}
            {#if isLeaf(value)}
              <!-- Leaf node (numeric value) -->
              <tr class={key.toLowerCase().includes('total') ? 'total' : ''} class:bg-slate-50={key.toLowerCase().includes('total')}>
                <td class={getPaddingClass(level)}>
                  {key.split(/(?=[A-Z])/).join(' ')}
                </td>
                <td class="text-right">
                  {#if editable}
                    <input 
                      type="number"
                      class="number-input w-32"
                      value={isNegative ? -value : value}
                      on:change={(e) => handleChange(key, e)}
                    />
                  {:else}
                    <span class={isNegative && value > 0 ? 'text-red-600' : ''}>
                      {formatCurrency(value)}
                    </span>
                  {/if}
                </td>
              </tr>
            {:else}
              <!-- Nested object, recurse -->
              <tr>
                <td 
                  colspan="2" 
                  class={`font-medium py-2 ${getPaddingClass(level - 0.5)} ${getBgClass(level)}`}
                >
                  {key.split(/(?=[A-Z])/).join(' ')}
                </td>
              </tr>
              <svelte:self 
                data={value} 
                level={level + 1} 
                {isNegative}
                {editable}
                onChange={(subKey, newValue) => onChange(`${key}.${subKey}`, newValue)}
              />
            {/if}
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>