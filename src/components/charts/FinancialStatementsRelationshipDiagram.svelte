<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { financialData } from '../../stores/financialStore';
  import { spring } from 'svelte/motion';
  
  export let width = 800;
  export let height = 600;
  export let interactiveMode = true;
  export let showLabels = true;
  export let enableDrag = true;
  export let zoomEnabled = true;
  export let showAmounts = true;
  
  // For animation effects
  const animationDuration = 750;
  
  let svg;
  let container;
  let tooltip;
  let zoomGroup;
  let simulation;
  
  // The current highlighted item
  let focusedItem = null;
  
  // For showing/hiding additional details
  let showDetail = {};
  
  // For zoom
  let zoom;
  
  // Store node positions with springs for smooth animation
  const nodePositions = spring({}, { stiffness: 0.1, damping: 0.7 });
  
  // Define our financial statement elements as nodes for the graph
  const createNodes = () => {
    const nodes = [
      // Balance Sheet Nodes
      { id: 'balanceSheet', group: 'statement', name: 'Balance Sheet', statementType: 'balanceSheet', mainNode: true },
      
      // Balance Sheet - Assets
      { id: 'assets', group: 'section', name: 'Assets', statementType: 'balanceSheet', parent: 'balanceSheet' },
      { id: 'currentAssets', group: 'subsection', name: 'Current Assets', statementType: 'balanceSheet', parent: 'assets', 
        value: $financialData.balanceSheet.totalCurrentAssets },
      { id: 'nonCurrentAssets', group: 'subsection', name: 'Non-Current Assets', statementType: 'balanceSheet', parent: 'assets',
        value: $financialData.balanceSheet.totalNonCurrentAssets },
      
      // Balance Sheet - Asset Items
      { id: 'cash', group: 'item', name: 'Cash', statementType: 'balanceSheet', parent: 'currentAssets', 
        value: $financialData.balanceSheet.assets.currentAssets.cash },
      { id: 'accountsReceivable', group: 'item', name: 'Accounts Receivable', statementType: 'balanceSheet', parent: 'currentAssets',
        value: $financialData.balanceSheet.assets.currentAssets.accountsReceivable },
      { id: 'inventory', group: 'item', name: 'Inventory', statementType: 'balanceSheet', parent: 'currentAssets',
        value: $financialData.balanceSheet.assets.currentAssets.inventory },
      
      { id: 'ppe', group: 'item', name: 'Property & Equipment', statementType: 'balanceSheet', parent: 'nonCurrentAssets',
        value: $financialData.balanceSheet.assets.nonCurrentAssets.property + $financialData.balanceSheet.assets.nonCurrentAssets.equipment },
      { id: 'accumulatedDepreciation', group: 'item', name: 'Accumulated Depreciation', statementType: 'balanceSheet', parent: 'nonCurrentAssets',
        value: $financialData.balanceSheet.assets.nonCurrentAssets.accumulatedDepreciation },
      
      // Balance Sheet - Liabilities & Equity
      { id: 'liabilitiesEquity', group: 'section', name: 'Liabilities & Equity', statementType: 'balanceSheet', parent: 'balanceSheet' },
      { id: 'liabilities', group: 'subsection', name: 'Liabilities', statementType: 'balanceSheet', parent: 'liabilitiesEquity',
        value: $financialData.balanceSheet.totalLiabilities },
      { id: 'equity', group: 'subsection', name: 'Equity', statementType: 'balanceSheet', parent: 'liabilitiesEquity',
        value: $financialData.balanceSheet.totalEquity },
      
      // Balance Sheet - Liability Items
      { id: 'accountsPayable', group: 'item', name: 'Accounts Payable', statementType: 'balanceSheet', parent: 'liabilities',
        value: $financialData.balanceSheet.liabilities.currentLiabilities.accountsPayable },
      { id: 'longTermDebt', group: 'item', name: 'Long-term Debt', statementType: 'balanceSheet', parent: 'liabilities',
        value: $financialData.balanceSheet.liabilities.nonCurrentLiabilities.longTermDebt },
      
      // Balance Sheet - Equity Items
      { id: 'retainedEarnings', group: 'item', name: 'Retained Earnings', statementType: 'balanceSheet', parent: 'equity',
        value: $financialData.balanceSheet.equity.retainedEarnings },
      { id: 'commonStock', group: 'item', name: 'Common Stock', statementType: 'balanceSheet', parent: 'equity',
        value: $financialData.balanceSheet.equity.commonStock },
      
      // Income Statement Nodes
      { id: 'incomeStatement', group: 'statement', name: 'Income Statement', statementType: 'incomeStatement', mainNode: true },
      
      // Income Statement - Revenue & Expenses
      { id: 'revenue', group: 'section', name: 'Revenue', statementType: 'incomeStatement', parent: 'incomeStatement',
        value: $financialData.incomeStatement.revenue },
      { id: 'expenses', group: 'section', name: 'Expenses', statementType: 'incomeStatement', parent: 'incomeStatement' },
      
      // Income Statement - Expense Items
      { id: 'cogs', group: 'item', name: 'Cost of Goods Sold', statementType: 'incomeStatement', parent: 'expenses',
        value: $financialData.incomeStatement.costOfGoodsSold },
      { id: 'operatingExpenses', group: 'subsection', name: 'Operating Expenses', statementType: 'incomeStatement', parent: 'expenses',
        value: $financialData.incomeStatement.totalOperatingExpenses },
      { id: 'interestExpense', group: 'item', name: 'Interest Expense', statementType: 'incomeStatement', parent: 'expenses',
        value: $financialData.incomeStatement.interestExpense },
      { id: 'taxExpense', group: 'item', name: 'Tax Expense', statementType: 'incomeStatement', parent: 'expenses',
        value: $financialData.incomeStatement.taxExpense },
      
      // Income Statement - Results
      { id: 'netIncome', group: 'result', name: 'Net Income', statementType: 'incomeStatement', parent: 'incomeStatement',
        value: $financialData.incomeStatement.netIncome },
      
      // Cash Flow Statement Nodes
      { id: 'cashFlowStatement', group: 'statement', name: 'Cash Flow Statement', statementType: 'cashFlowStatement', mainNode: true },
      
      // Cash Flow Statement - Activity Sections
      { id: 'operatingActivities', group: 'section', name: 'Operating Activities', statementType: 'cashFlowStatement', parent: 'cashFlowStatement',
        value: $financialData.cashFlowStatement.totalOperatingCashFlow },
      { id: 'investingActivities', group: 'section', name: 'Investing Activities', statementType: 'cashFlowStatement', parent: 'cashFlowStatement',
        value: $financialData.cashFlowStatement.totalInvestingCashFlow },
      { id: 'financingActivities', group: 'section', name: 'Financing Activities', statementType: 'cashFlowStatement', parent: 'cashFlowStatement',
        value: $financialData.cashFlowStatement.totalFinancingCashFlow },
      
      // Cash Flow Statement - Operating Items
      { id: 'cfNetIncome', group: 'item', name: 'Net Income Adjustment', statementType: 'cashFlowStatement', parent: 'operatingActivities',
        value: $financialData.cashFlowStatement.operatingActivities.netIncome },
      { id: 'cfDepreciation', group: 'item', name: 'Depreciation', statementType: 'cashFlowStatement', parent: 'operatingActivities',
        value: $financialData.cashFlowStatement.operatingActivities.depreciation },
      { id: 'cfInventoryChange', group: 'item', name: 'Change in Inventory', statementType: 'cashFlowStatement', parent: 'operatingActivities',
        value: $financialData.cashFlowStatement.operatingActivities.changeInInventory },
      { id: 'cfARChange', group: 'item', name: 'Change in Accounts Receivable', statementType: 'cashFlowStatement', parent: 'operatingActivities',
        value: $financialData.cashFlowStatement.operatingActivities.changeInAccountsReceivable },
      { id: 'cfAPChange', group: 'item', name: 'Change in Accounts Payable', statementType: 'cashFlowStatement', parent: 'operatingActivities',
        value: $financialData.cashFlowStatement.operatingActivities.changeInAccountsPayable },
      
      // Cash Flow Statement - Investing Items
      { id: 'cfPurchaseEquipment', group: 'item', name: 'Purchase of Equipment', statementType: 'cashFlowStatement', parent: 'investingActivities',
        value: $financialData.cashFlowStatement.investingActivities.purchaseOfEquipment },
      
      // Cash Flow Statement - Financing Items
      { id: 'cfDebtRepayment', group: 'item', name: 'Debt Repayment', statementType: 'cashFlowStatement', parent: 'financingActivities',
        value: $financialData.cashFlowStatement.financingActivities.debtRepayment },
      { id: 'cfDividendsPaid', group: 'item', name: 'Dividends Paid', statementType: 'cashFlowStatement', parent: 'financingActivities',
        value: $financialData.cashFlowStatement.financingActivities.dividendsPaid },
      
      // Cash Flow Statement - Result
      { id: 'netCashFlow', group: 'result', name: 'Net Cash Flow', statementType: 'cashFlowStatement', parent: 'cashFlowStatement',
        value: $financialData.cashFlowStatement.netCashFlow },
    ];
    
    return nodes;
  };
  
  // Define links between nodes showing key relationships
  const createLinks = () => {
    return [
      // Key relationships between statements
      { source: 'netIncome', target: 'retainedEarnings', type: 'cross-statement', value: Math.abs($financialData.incomeStatement.netIncome),
        description: 'Net Income flows to Retained Earnings', highlighted: false },
      { source: 'netIncome', target: 'cfNetIncome', type: 'cross-statement', value: Math.abs($financialData.incomeStatement.netIncome),
        description: 'Net Income is the starting point for Operating Cash Flow', highlighted: false },
      { source: 'accumulatedDepreciation', target: 'cfDepreciation', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.operatingActivities.depreciation),
        description: 'Depreciation is a non-cash expense added back to Cash Flow', highlighted: false },
      { source: 'inventory', target: 'cfInventoryChange', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.operatingActivities.changeInInventory),
        description: 'Change in Inventory affects Operating Cash Flow', highlighted: false },
      { source: 'accountsReceivable', target: 'cfARChange', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.operatingActivities.changeInAccountsReceivable),
        description: 'Change in Accounts Receivable affects Operating Cash Flow', highlighted: false },
      { source: 'accountsPayable', target: 'cfAPChange', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.operatingActivities.changeInAccountsPayable),
        description: 'Change in Accounts Payable affects Operating Cash Flow', highlighted: false },
      { source: 'netCashFlow', target: 'cash', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.netCashFlow),
        description: 'Net Cash Flow updates the Cash account', highlighted: false },
      { source: 'longTermDebt', target: 'cfDebtRepayment', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.financingActivities.debtRepayment),
        description: 'Debt Repayment reduces Long-term Debt', highlighted: false },
      { source: 'retainedEarnings', target: 'cfDividendsPaid', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.financingActivities.dividendsPaid),
        description: 'Dividends reduce Retained Earnings', highlighted: false },
      { source: 'revenue', target: 'accountsReceivable', type: 'cross-statement', value: $financialData.balanceSheet.assets.currentAssets.accountsReceivable * 0.5, 
        description: 'Revenue may be recorded as Accounts Receivable until payment is received', highlighted: false },
      { source: 'cogs', target: 'inventory', type: 'cross-statement', value: $financialData.incomeStatement.costOfGoodsSold * 0.5,
        description: 'Cost of Goods Sold reduces Inventory', highlighted: false },
      { source: 'ppe', target: 'cfPurchaseEquipment', type: 'cross-statement', value: Math.abs($financialData.cashFlowStatement.investingActivities.purchaseOfEquipment),
        description: 'Purchase of Equipment increases PP&E', highlighted: false },
      
      // Hierarchical links within statements
      
      // Balance Sheet Structure
      { source: 'balanceSheet', target: 'assets', type: 'hierarchy' },
      { source: 'balanceSheet', target: 'liabilitiesEquity', type: 'hierarchy' },
      { source: 'assets', target: 'currentAssets', type: 'hierarchy' },
      { source: 'assets', target: 'nonCurrentAssets', type: 'hierarchy' },
      { source: 'liabilitiesEquity', target: 'liabilities', type: 'hierarchy' },
      { source: 'liabilitiesEquity', target: 'equity', type: 'hierarchy' },
      { source: 'currentAssets', target: 'cash', type: 'hierarchy' },
      { source: 'currentAssets', target: 'inventory', type: 'hierarchy' },
      { source: 'currentAssets', target: 'accountsReceivable', type: 'hierarchy' },
      { source: 'nonCurrentAssets', target: 'ppe', type: 'hierarchy' },
      { source: 'nonCurrentAssets', target: 'accumulatedDepreciation', type: 'hierarchy' },
      { source: 'liabilities', target: 'accountsPayable', type: 'hierarchy' },
      { source: 'liabilities', target: 'longTermDebt', type: 'hierarchy' },
      { source: 'equity', target: 'retainedEarnings', type: 'hierarchy' },
      { source: 'equity', target: 'commonStock', type: 'hierarchy' },
      
      // Income Statement Structure
      { source: 'incomeStatement', target: 'revenue', type: 'hierarchy' },
      { source: 'incomeStatement', target: 'expenses', type: 'hierarchy' },
      { source: 'incomeStatement', target: 'netIncome', type: 'hierarchy' },
      { source: 'expenses', target: 'cogs', type: 'hierarchy' },
      { source: 'expenses', target: 'operatingExpenses', type: 'hierarchy' },
      { source: 'expenses', target: 'interestExpense', type: 'hierarchy' },
      { source: 'expenses', target: 'taxExpense', type: 'hierarchy' },
      
      // Cash Flow Statement Structure
      { source: 'cashFlowStatement', target: 'operatingActivities', type: 'hierarchy' },
      { source: 'cashFlowStatement', target: 'investingActivities', type: 'hierarchy' },
      { source: 'cashFlowStatement', target: 'financingActivities', type: 'hierarchy' },
      { source: 'cashFlowStatement', target: 'netCashFlow', type: 'hierarchy' },
      { source: 'operatingActivities', target: 'cfNetIncome', type: 'hierarchy' },
      { source: 'operatingActivities', target: 'cfDepreciation', type: 'hierarchy' },
      { source: 'operatingActivities', target: 'cfInventoryChange', type: 'hierarchy' },
      { source: 'operatingActivities', target: 'cfARChange', type: 'hierarchy' },
      { source: 'operatingActivities', target: 'cfAPChange', type: 'hierarchy' },
      { source: 'investingActivities', target: 'cfPurchaseEquipment', type: 'hierarchy' },
      { source: 'financingActivities', target: 'cfDebtRepayment', type: 'hierarchy' },
      { source: 'financingActivities', target: 'cfDividendsPaid', type: 'hierarchy' },
    ];
  };
  
  function formatCurrency(value) {
    // Handle positive and negative values properly
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    return sign + '$' + absValue.toLocaleString();
  }
  
  function renderDiagram() {
    if (!svg || !container) return;
    
    // Create the nodes and links
    const nodes = createNodes();
    const links = createLinks();
    
    // Clear previous elements
    d3.select(container).selectAll('*').remove();
    
    // Create SVG 
    const svgElement = d3.select(container)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Add a group that will be transformed for zoom
    zoomGroup = svgElement.append('g');
    
    // Create tooltip if it doesn't exist
    if (!tooltip) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'absolute p-3 bg-slate-800 text-white text-sm rounded-md shadow-lg max-w-xs invisible opacity-0 transition-opacity z-50')
        .style('pointer-events', 'none');
    }
    
    // Create zoom behavior
    if (zoomEnabled) {
      zoom = d3.zoom()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => {
          zoomGroup.attr('transform', event.transform);
        });
      
      svgElement.call(zoom);
    }
    
    // Create a force simulation
    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          if (d.type === 'hierarchy') return 75;
          return 150; // Cross-statement links are longer
        })
        .strength(d => {
          if (d.type === 'hierarchy') return 0.7;
          return 0.3; // Cross-statement links are weaker
        }))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40).strength(0.7))
      .force('x', d3.forceX(d => {
        if (d.statementType === 'balanceSheet') return width * 0.75;
        if (d.statementType === 'incomeStatement') return width * 0.25;
        if (d.statementType === 'cashFlowStatement') return width * 0.5;
        return null;
      }).strength(d => d.mainNode ? 0.5 : 0.1))
      .force('y', d3.forceY(d => {
        if (d.statementType === 'balanceSheet') return height * 0.5;
        if (d.statementType === 'incomeStatement') return height * 0.25;
        if (d.statementType === 'cashFlowStatement') return height * 0.75;
        return null;
      }).strength(d => d.mainNode ? 0.5 : 0.1));
    
    // Define arrow marker for link directionality
    svgElement.append('defs').selectAll('marker')
      .data(['standard', 'highlighted'])
      .enter().append('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)  // Position the arrow away from node
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', d => d === 'highlighted' ? '#3b82f6' : '#94a3b8');
    
    // Create the links
    const link = zoomGroup.append('g')
        .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .enter().append('path')
        .attr('class', 'link')
        .attr('stroke', d => d.type === 'cross-statement' ? (d.highlighted ? '#3b82f6' : '#94a3b8') : '#ddd')
        .attr('stroke-width', d => {
          if (d.type === 'hierarchy') return 1;
          
          // Scale cross-statement links based on value
          const minWidth = 1.5;
          const maxWidth = 6;
          const minValue = 1000;
          const maxValue = 100000;
          const value = d.value || minValue;
          return minWidth + ((Math.min(value, maxValue) - minValue) / (maxValue - minValue)) * (maxWidth - minWidth);
        })
        .attr('stroke-dasharray', d => d.type === 'hierarchy' ? '3,3' : null)
        .attr('opacity', d => d.type === 'hierarchy' ? 0.6 : 0.8)
        .attr('marker-end', d => d.type === 'cross-statement' ? 
          (d.highlighted ? 'url(#arrow-highlighted)' : 'url(#arrow-standard)') : null)
        .attr('fill', 'none')
        .on('mouseover', function(event, d) {
          if (d.type === 'cross-statement') {
            d3.select(this)
              .attr('stroke', '#3b82f6')
              .attr('opacity', 1)
              .attr('stroke-width', d.type === 'hierarchy' ? 1.5 : 
                (d.value ? Math.min(8, d.value / 10000) : 3))
              .attr('marker-end', 'url(#arrow-highlighted)');
            
            // Show tooltip for cross-statement links
            tooltip
              .style('opacity', 1)
              .style('visibility', 'visible')
              .html(`
                <div class="font-medium">${d.description}</div>
                ${d.value ? `<div class="mt-1 font-medium">Amount: ${formatCurrency(d.value)}</div>` : ''}
              `)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY + 10) + 'px');
          }
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .attr('stroke', d.type === 'cross-statement' ? (d.highlighted ? '#3b82f6' : '#94a3b8') : '#ddd')
            .attr('opacity', d.type === 'hierarchy' ? 0.6 : 0.8)
            .attr('stroke-width', d => {
              if (d.type === 'hierarchy') return 1;
              
              // Scale cross-statement links based on value
              const minWidth = 1.5;
              const maxWidth = 6;
              const minValue = 1000;
              const maxValue = 100000;
              const value = d.value || minValue;
              return minWidth + ((Math.min(value, maxValue) - minValue) / (maxValue - minValue)) * (maxWidth - minWidth);
            })
            .attr('marker-end', d.type === 'cross-statement' ? 
              (d.highlighted ? 'url(#arrow-highlighted)' : 'url(#arrow-standard)') : null);
          
          tooltip
            .style('opacity', 0)
            .style('visibility', 'hidden');
        });
    
    // Create the nodes
    const node = zoomGroup.append('g')
        .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded))
        .on('click', (event, d) => {
          if (d.group === 'statement' || d.group === 'section' || d.group === 'subsection') {
            // Toggle details for this section
            showDetail[d.id] = !showDetail[d.id];
            renderDiagram(); // Re-render to update visibility
          }
          
          // Highlight connecting nodes
          focusedItem = d.id === focusedItem ? null : d.id;
          
          // Update the link highlighting
          link.attr('stroke', l => {
            if (l.type === 'hierarchy') return '#ddd';
            
            if (focusedItem && (l.source.id === focusedItem || l.target.id === focusedItem)) {
              l.highlighted = true;
              return '#3b82f6';
            } else {
              l.highlighted = false;
              return '#94a3b8';
            }
          });
          
          // Update markers based on highlighting
          link.attr('marker-end', l => {
            if (l.type !== 'cross-statement') return null;
            return l.highlighted ? 'url(#arrow-highlighted)' : 'url(#arrow-standard)';
          });
          
          // Update node styling
          node.select('circle')
            .attr('stroke', n => {
              if (n.id === focusedItem) return '#3b82f6';
              
              if (focusedItem) {
                // Check if this node is connected to the focused node
                const isConnected = links.some(l => 
                  (l.source.id === focusedItem && l.target.id === n.id) || 
                  (l.target.id === focusedItem && l.source.id === n.id)
                );
                return isConnected ? '#3b82f6' : '#e2e8f0';
              }
              
              return '#e2e8f0';
            })
            .attr('stroke-width', n => n.id === focusedItem ? 3 : 1.5);
        })
        .on('mouseover', function(event, d) {
          // Emphasize the node and show tooltip
          d3.select(this).select('circle')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 3);
          
          tooltip
            .style('opacity', 1)
            .style('visibility', 'visible')
            .html(`
              <div class="font-medium">${d.name}</div>
              ${d.value !== undefined ? `<div class="mt-1">Value: ${formatCurrency(d.value)}</div>` : ''}
              ${d.description ? `<div class="mt-1 text-slate-300">${d.description}</div>` : ''}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function(event, d) {
          // Reset node appearance unless it's the focused node
          d3.select(this).select('circle')
            .attr('stroke', d.id === focusedItem ? '#3b82f6' : '#e2e8f0')
            .attr('stroke-width', d.id === focusedItem ? 3 : 1.5);
          
          tooltip
            .style('opacity', 0)
            .style('visibility', 'hidden');
        });
    
    // Add circles to the nodes
    node.append('circle')
      .attr('r', d => {
        if (d.group === 'statement') return 25;
        if (d.group === 'section') return 20;
        if (d.group === 'subsection') return 16;
        if (d.group === 'result') return 18;
        return 14; // items
      })
      .attr('fill', d => {
        if (d.statementType === 'balanceSheet') {
          if (d.group === 'statement') return '#a5b4fc'; // Indigo 300
          if (d.group === 'section') return '#c4b5fd'; // Violet 300
          if (d.parent === 'assets') return '#ddd6fe'; // Violet 200
          if (d.parent === 'liabilitiesEquity') return '#c7d2fe'; // Indigo 200
          return '#e0e7ff'; // Indigo 100
        }
        if (d.statementType === 'incomeStatement') {
          if (d.group === 'statement') return '#4ade80'; // Green 400
          if (d.group === 'section') return '#86efac'; // Green 300
          if (d.parent === 'expenses') return '#d9f99d'; // Lime 200
          if (d.group === 'result') return '#bbf7d0'; // Green 200
          return '#dcfce7'; // Green 100
        }
        if (d.statementType === 'cashFlowStatement') {
          if (d.group === 'statement') return '#fb923c'; // Orange 400
          if (d.group === 'section') return '#fdba74'; // Orange 300
          if (d.group === 'result') return '#fed7aa'; // Orange 200
          return '#ffedd5'; // Orange 100
        }
        return '#f1f5f9'; // Slate 100 - default
      })
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1.5);
    
    // Add labels to the nodes
    if (showLabels) {
      node.append('text')
        .attr('dy', d => {
          if (d.group === 'statement') return 35;
          if (d.group === 'section') return 30;
          return 25;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', '#334155')
        .style('font-size', d => {
          if (d.group === 'statement') return '0.9rem';
          return '0.75rem';
        })
        .style('font-weight', d => d.group === 'statement' ? 'bold' : 'normal')
        .text(d => d.name);
    }
    
    // Show amounts if enabled
    if (showAmounts) {
      node.filter(d => d.value !== undefined)
        .append('text')
        .attr('dy', d => {
          if (d.group === 'statement') return 50;
          if (d.group === 'section') return 45;
          return 40;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', d => d.value < 0 ? '#dc2626' : '#334155') // Red for negative values
        .style('font-size', '0.7rem')
        .style('font-weight', 'medium')
        .text(d => formatCurrency(d.value));
    }
    
    // Update positions on tick
    simulation.on('tick', () => {
      // Update links with curved paths
      link.attr('d', d => {
        // For hierarchy links, use straight lines
        if (d.type === 'hierarchy') {
          return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
        }
        
        // For cross-statement links, use curved paths
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve factor
        
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      
      // Update node positions
      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
    
    // Initial simulation run
    simulation.alpha(1).restart();
  }
  
  // D3 drag functions
  function dragStarted(event, d) {
    if (!enableDrag) return;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    if (!enableDrag) return;
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragEnded(event, d) {
    if (!enableDrag) return;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
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
  
  // Redraw when the component updates
  afterUpdate(() => {
    renderDiagram();
  });
</script>

<div class="w-full h-full flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg shadow-inner p-2">
  <svg bind:this={container} width={width} height={height} class="max-w-full">
    <!-- Diagram will be rendered here -->
  </svg>
  
  {#if interactiveMode}
    <div class="absolute top-4 right-4 flex flex-col gap-2">
      <button 
        class="p-2 bg-white rounded-md shadow-sm hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
        on:click={() => { if (zoom) zoom.scaleTo(d3.select(svg), 1); }}>
        Reset Zoom
      </button>
    </div>
  {/if}
</div>

<style>
  /* Additional styling as needed */
</style>