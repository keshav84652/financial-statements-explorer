<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let data;
  export let width = 500;
  export let height = 300;
  
  let svg;
  
  $: if (svg && data) {
    renderChart();
  }
  
  function renderChart() {
    // Clear previous chart
    d3.select(svg).selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svgEl = d3.select(svg)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    const g = svgEl.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Define scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.quarter))
      .range([0, innerWidth])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.revenue, d.expenses, d.profit)) * 1.1])
      .range([innerHeight, 0]);
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('font-size', '12px')
        .attr('fill', '#64748b');
    
    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `$${d / 1000}k`))
      .selectAll('text')
        .attr('font-size', '12px')
        .attr('fill', '#64748b');
    
    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#64748b')
      .text('Amount ($)');
    
    // Define color scale
    const color = d3.scaleOrdinal()
      .domain(['revenue', 'expenses', 'profit'])
      .range(['#3b82f6', '#ef4444', '#22c55e']);
    
    // Create subgroups for each data type
    const subgroups = ['revenue', 'expenses', 'profit'];
    
    // Create group scale
    const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding(0.05);
    
    // Create tooltip div
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute p-2 bg-neutral text-white text-xs rounded shadow-lg z-50')
      .style('opacity', 0)
      .style('pointer-events', 'none');
    
    // Add bars
    g.append('g')
      .selectAll('g')
      .data(data)
      .join('g')
        .attr('transform', d => `translate(${x(d.quarter)},0)`)
      .selectAll('rect')
      .data(d => subgroups.map(key => ({key, value: d[key], quarter: d.quarter})))
      .join('rect')
        .attr('x', d => xSubgroup(d.key))
        .attr('y', d => y(d.value))
        .attr('width', xSubgroup.bandwidth())
        .attr('height', d => innerHeight - y(d.value))
        .attr('fill', d => color(d.key))
        .attr('rx', 2)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);
          
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
            
          tooltip.html(`
            <div class="font-medium">${d.quarter} ${d.key[0].toUpperCase() + d.key.slice(1)}</div>
            <div>${d3.format('$,.0f')(d.value)}</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    
    // Add legend
    const legend = svgEl.append('g')
      .attr('transform', `translate(${width - margin.right - 120}, ${margin.top})`);
    
    subgroups.forEach((group, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
        
      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(group));
        
      legendRow.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('font-size', '12px')
        .attr('fill', '#64748b')
        .text(group[0].toUpperCase() + group.slice(1));
    });
  }
  
  onMount(() => {
    if (data) {
      renderChart();
    }
    
    // Cleanup function to remove tooltip on unmount
    return () => {
      d3.select('body').selectAll('div.tooltip').remove();
    };
  });
</script>

<div class="w-full h-full flex items-center justify-center">
  <svg bind:this={svg} width={width} height={height} class="max-w-full"></svg>
</div>