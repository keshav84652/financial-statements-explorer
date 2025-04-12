<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let data;
  export let width = 500;
  export let height = 300;
  export let color = '#3b82f6'; // Default blue color
  export let areaFill = true;
  
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
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
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
      .text('Revenue ($)');
    
    // Define line path generator
    const line = d3.line()
      .x(d => x(d.month) + x.bandwidth() / 2)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Create tooltip div
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute p-2 bg-neutral text-white text-xs rounded shadow-lg z-50')
      .style('opacity', 0)
      .style('pointer-events', 'none');
    
    // If area fill is enabled, add area 
    if (areaFill) {
      const area = d3.area()
        .x(d => x(d.month) + x.bandwidth() / 2)
        .y0(innerHeight)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);
      
      g.append('path')
        .datum(data)
        .attr('fill', color)
        .attr('fill-opacity', 0.1)
        .attr('d', area);
    }
    
    // Add the line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line);
    
    // Add data points
    g.selectAll('.data-point')
      .data(data)
      .join('circle')
        .attr('class', 'data-point')
        .attr('cx', d => x(d.month) + x.bandwidth() / 2)
        .attr('cy', d => y(d.value))
        .attr('r', 5)
        .attr('fill', 'white')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('r', 7)
            .attr('fill', color);
          
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
            
          tooltip.html(`
            <div class="font-medium">${d.month}</div>
            <div>${d3.format('$,.0f')(d.value)}</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('r', 5)
            .attr('fill', 'white');
          
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
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