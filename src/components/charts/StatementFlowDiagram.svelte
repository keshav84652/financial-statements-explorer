<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { financialData } from '../../stores/financialStore';
  
  export let highlightedFlow = null;
  export let width = 800;
  export let height = 600;
  
  let svg;
  let container;
  let tooltip;
  
  // Define statement nodes and their relationships
  const statements = [
    { id: 'balanceSheet', name: 'Balance Sheet', x: width * 0.75, y: height * 0.5 },
    { id: 'incomeStatement', name: 'Income Statement', x: width * 0.25, y: height * 0.25 },
    { id: 'cashFlowStatement', name: 'Cash Flow Statement', x: width * 0.25, y: height * 0.75 },
  ];
  
  // Define connections between statements
  const connections = [
    { 
      source: 'incomeStatement', 
      target: 'balanceSheet', 
      id: 'netIncome',
      name: 'Net Income',
      description: 'Net income from the Income Statement flows to Retained Earnings in the Balance Sheet',
      value: 0, // This will be updated with actual data
      path: [
        { x: width * 0.25, y: height * 0.25 },
        { x: width * 0.5, y: height * 0.3 },
        { x: width * 0.75, y: height * 0.5 }
      ]
    },
    { 
      source: 'incomeStatement', 
      target: 'cashFlowStatement', 
      id: 'netIncomeToOperatingCashFlow',
      name: 'Net Income Adjustment',
      description: 'Net income is the starting point for the Cash Flow Statement\'s Operating Activities section',
      value: 0,
      path: [
        { x: width * 0.25, y: height * 0.25 },
        { x: width * 0.15, y: height * 0.5 },
        { x: width * 0.25, y: height * 0.75 }
      ]
    },
    { 
      source: 'balanceSheet', 
      target: 'cashFlowStatement', 
      id: 'assetChangesToCashFlow',
      name: 'Changes in Assets',
      description: 'Changes in current assets (like Accounts Receivable or Inventory) affect Operating Cash Flow',
      value: 0,
      path: [
        { x: width * 0.75, y: height * 0.5 },
        { x: width * 0.5, y: height * 0.7 },
        { x: width * 0.25, y: height * 0.75 }
      ]
    },
    { 
      source: 'cashFlowStatement', 
      target: 'balanceSheet', 
      id: 'cashFlowToCash',
      name: 'Net Cash Flow',
      description: 'Net cash flow from all activities updates the Cash account on the Balance Sheet',
      value: 0,
      path: [
        { x: width * 0.25, y: height * 0.75 },
        { x: width * 0.5, y: height * 0.6 },
        { x: width * 0.75, y: height * 0.5 }
      ]
    }
  ];
  
  // Update connection values based on financial data
  $: {
    if ($financialData) {
      connections.forEach(conn => {
        if (conn.id === 'netIncome') {
          conn.value = $financialData.incomeStatement.netIncome;
        } else if (conn.id === 'netIncomeToOperatingCashFlow') {
          conn.value = $financialData.incomeStatement.netIncome;
        } else if (conn.id === 'assetChangesToCashFlow') {
          // Sum of changes in current assets
          conn.value = $financialData.cashFlowStatement.operatingActivities.changeInInventory +
                       $financialData.cashFlowStatement.operatingActivities.changeInAccountsReceivable;
        } else if (conn.id === 'cashFlowToCash') {
          conn.value = $financialData.cashFlowStatement.netCashFlow;
        }
      });
      
      renderDiagram();
    }
  }
  
  function renderDiagram() {
    if (!svg || !container) return;
    
    // Clear previous elements
    d3.select(container).selectAll('*').remove();
    
    // Create SVG 
    const svgElement = d3.select(container)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Create tooltip if it doesn't exist
    if (!tooltip) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'absolute p-2 bg-neutral text-white text-sm rounded shadow-lg max-w-xs invisible opacity-0 transition-opacity z-50')
        .style('pointer-events', 'none');
    }
    
    // Create a line generator with curved paths
    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveBasis);
    
    // Draw connections (links between nodes)
    const links = svgElement.append('g')
      .selectAll('path')
      .data(connections)
      .join('path')
        .attr('d', d => lineGenerator(d.path))
        .attr('fill', 'none')
        .attr('stroke', d => highlightedFlow === d.id ? '#3b82f6' : '#94a3b8') // Blue when highlighted, gray otherwise
        .attr('stroke-width', d => {
          // Scale width based on value, with minimum of 2 and maximum of 10
          const minWidth = 2;
          const maxWidth = 10;
          const minValue = 1000; // Minimum value for scaling
          const maxValue = 100000; // Maximum value for scaling
          const absValue = Math.abs(d.value);
          return minWidth + ((absValue - minValue) / (maxValue - minValue)) * (maxWidth - minWidth);
        })
        .attr('stroke-opacity', d => highlightedFlow === d.id ? 1 : 0.6)
        .attr('marker-end', 'url(#arrowhead)')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('stroke', '#3b82f6')
            .attr('stroke-opacity', 1)
            .attr('stroke-width', d => {
              // Increase the width slightly on hover
              const currentWidth = d3.select(this).attr('stroke-width');
              return parseInt(currentWidth) + 2;
            });
            
          tooltip
            .style('opacity', 1)
            .style('visibility', 'visible')
            .html(`
              <div class="font-medium">${d.name}</div>
              <div>${d.description}</div>
              <div class="mt-1 font-medium">Value: $${Math.abs(d.value).toLocaleString()}</div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', d => highlightedFlow === d.id ? '#3b82f6' : '#94a3b8')
            .attr('stroke-opacity', d => highlightedFlow === d.id ? 1 : 0.6)
            .attr('stroke-width', d => {
              // Restore original width
              const minWidth = 2;
              const maxWidth = 10;
              const minValue = 1000;
              const maxValue = 100000;
              const absValue = Math.abs(d.value);
              return minWidth + ((absValue - minValue) / (maxValue - minValue)) * (maxWidth - minWidth);
            });
            
          tooltip
            .style('opacity', 0)
            .style('visibility', 'hidden');
        });
    
    // Create arrow marker definition
    svgElement.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#94a3b8');
    
    // Draw nodes (financial statements)
    const nodes = svgElement.append('g')
      .selectAll('g')
      .data(statements)
      .join('g')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // Add rectangle backgrounds for nodes
    nodes.append('rect')
      .attr('x', -100)
      .attr('y', -40)
      .attr('width', 200)
      .attr('height', 80)
      .attr('fill', '#ffffff')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('rx', 8)
      .attr('ry', 8);
    
    // Add statement names
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '16px')
      .attr('fill', '#334155')
      .text(d => d.name);
    
    // Add flow markers (small circles at path endpoints)
    connections.forEach(conn => {
      const startPoint = conn.path[0];
      const endPoint = conn.path[conn.path.length - 1];
      
      // Start point marker
      svgElement.append('circle')
        .attr('cx', startPoint.x)
        .attr('cy', startPoint.y)
        .attr('r', 4)
        .attr('fill', highlightedFlow === conn.id ? '#3b82f6' : '#94a3b8');
        
      // End point marker is covered by the arrowhead
    });
  }
  
  onMount(() => {
    renderDiagram();
    
    // Cleanup tooltip on component destroy
    return () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    };
  });
</script>

<div class="w-full h-full flex items-center justify-center overflow-hidden">
  <svg bind:this={container} width={width} height={height} class="max-w-full">
    <!-- Diagram will be rendered here -->
  </svg>
</div>