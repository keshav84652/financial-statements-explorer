<script>
  import { afterUpdate, onMount } from 'svelte';
  import * as d3 from 'd3';
  import { financialData } from '../../stores/financialStore';
  import { ChevronDown, ChevronUp, Info } from 'lucide-svelte';
  
  export let width = 900;
  export let height = 600;
  export let transaction = null; // The transaction to visualize
  export let animated = true;
  export let showBeforeAfter = true;
  export let showImpacts = true;
  
  let svg;
  let tooltip;
  let animationInProgress = false;
  
  // Colors for different statement sections
  const colors = {
    balanceSheet: {
      heading: '#a5b4fc', // Indigo 300
      assets: '#ddd6fe', // Violet 200
      liabilities: '#c7d2fe', // Indigo 200
      equity: '#e0e7ff' // Indigo 100
    },
    incomeStatement: {
      heading: '#4ade80', // Green 400
      revenue: '#86efac', // Green 300
      expenses: '#d9f99d', // Lime 200
      netIncome: '#bbf7d0' // Green 200
    },
    cashFlowStatement: {
      heading: '#fb923c', // Orange 400
      operations: '#fdba74', // Orange 300
      investing: '#fed7aa', // Orange 200
      financing: '#ffedd5' // Orange 100
    },
    impact: {
      increase: '#4ade80', // Green 400
      decrease: '#f87171', // Red 400
      neutral: '#94a3b8' // Slate 400
    }
  };
  
  // Helper function to get the change type
  function getChangeType(value) {
    if (value > 0) return 'increase';
    if (value < 0) return 'decrease';
    return 'neutral';
  }
  
  // Helper function to format currency
  function formatCurrency(value) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '+';
    return (value > 0 ? '+' : '') + '$' + absValue.toLocaleString();
  }
  
  // Process the transaction to identify affected accounts
  function processTransaction(transaction) {
    if (!transaction) return null;
    
    // Extract the original and affected data from the transaction
    const result = {
      transaction: {...transaction},
      impacts: [],
      statementSections: {
        balanceSheet: {
          assets: [],
          liabilities: [],
          equity: []
        },
        incomeStatement: {
          revenue: [],
          expenses: [],
          netIncome: []
        },
        cashFlowStatement: {
          operations: [],
          investing: [],
          financing: []
        }
      }
    };
    
    // Helper function to add an impact
    const addImpact = (statement, section, account, amount, description) => {
      const impact = {
        statement,
        section,
        account,
        amount,
        description,
        changeType: getChangeType(amount)
      };
      
      result.impacts.push(impact);
      
      // Add to the appropriate statement section
      if (result.statementSections[statement] && 
          result.statementSections[statement][section]) {
        result.statementSections[statement][section].push(impact);
      }
    };
    
    // Process different transaction types
    switch (transaction.type) {
      case 'sale':
        // Income Statement
        addImpact(
          'incomeStatement', 
          'revenue', 
          'Revenue', 
          transaction.amount, 
          'Sales revenue increases'
        );
        
        // Balance Sheet
        if (transaction.paymentMethod === 'cash') {
          addImpact(
            'balanceSheet',
            'assets',
            'Cash',
            transaction.amount,
            'Cash received from sale'
          );
        } else {
          addImpact(
            'balanceSheet',
            'assets',
            'Accounts Receivable',
            transaction.amount,
            'Customer debt from sale on credit'
          );
        }
        
        // If there's cost of goods sold
        if (transaction.cogs) {
          addImpact(
            'incomeStatement',
            'expenses',
            'Cost of Goods Sold',
            -transaction.cogs,
            'Cost of items sold reduces profit'
          );
          
          addImpact(
            'balanceSheet',
            'assets',
            'Inventory',
            -transaction.cogs,
            'Inventory decreased due to sale'
          );
        }
        
        // Cash Flow Statement
        if (transaction.paymentMethod === 'cash') {
          addImpact(
            'cashFlowStatement',
            'operations',
            'Cash from Operations',
            transaction.amount,
            'Operating cash flow from sales'
          );
        } else {
          addImpact(
            'cashFlowStatement',
            'operations',
            'Change in Accounts Receivable',
            -transaction.amount,
            'Increase in accounts receivable (negative adjustment)'
          );
        }
        
        // Net Income impact
        const netIncomeImpact = transaction.amount - (transaction.cogs || 0);
        addImpact(
          'incomeStatement',
          'netIncome',
          'Net Income',
          netIncomeImpact,
          'Overall profit from sale'
        );
        
        // Retained Earnings impact
        addImpact(
          'balanceSheet',
          'equity',
          'Retained Earnings',
          netIncomeImpact,
          'Profit increases retained earnings'
        );
        break;
        
      case 'purchase':
        // Balance Sheet - inventory increases
        addImpact(
          'balanceSheet',
          'assets',
          'Inventory',
          transaction.amount,
          'Inventory purchased'
        );
        
        // Payment method affects different accounts
        if (transaction.paymentMethod === 'cash') {
          addImpact(
            'balanceSheet',
            'assets',
            'Cash',
            -transaction.amount,
            'Cash paid for inventory'
          );
          
          addImpact(
            'cashFlowStatement',
            'operations',
            'Change in Inventory',
            -transaction.amount,
            'Cash outflow for inventory purchase'
          );
        } else {
          addImpact(
            'balanceSheet',
            'liabilities',
            'Accounts Payable',
            transaction.amount,
            'Debt for inventory purchased on credit'
          );
          
          addImpact(
            'cashFlowStatement',
            'operations',
            'Change in Accounts Payable',
            transaction.amount,
            'Increase in accounts payable (positive adjustment)'
          );
        }
        break;
        
      case 'expense':
        // Income Statement
        const expenseAccount = transaction.expenseType || 'Other Expenses';
        addImpact(
          'incomeStatement',
          'expenses',
          expenseAccount,
          -transaction.amount,
          `${expenseAccount} reduces profit`
        );
        
        // Balance Sheet
        if (transaction.paymentMethod === 'cash') {
          addImpact(
            'balanceSheet',
            'assets',
            'Cash',
            -transaction.amount,
            'Cash paid for expense'
          );
        } else {
          addImpact(
            'balanceSheet',
            'liabilities',
            'Accounts Payable',
            transaction.amount,
            'Liability for expense on credit'
          );
        }
        
        // Cash Flow Statement
        if (transaction.paymentMethod === 'cash') {
          addImpact(
            'cashFlowStatement',
            'operations',
            'Cash from Operations',
            -transaction.amount,
            'Cash outflow for operational expense'
          );
        } else {
          addImpact(
            'cashFlowStatement',
            'operations',
            'Change in Accounts Payable',
            transaction.amount,
            'Increase in accounts payable (positive adjustment)'
          );
        }
        
        // Net Income impact
        addImpact(
          'incomeStatement',
          'netIncome',
          'Net Income',
          -transaction.amount,
          'Expense reduces net income'
        );
        
        // Retained Earnings impact
        addImpact(
          'balanceSheet',
          'equity',
          'Retained Earnings',
          -transaction.amount,
          'Expense reduces retained earnings'
        );
        break;
        
      case 'asset-purchase':
        // Balance Sheet - asset increase
        const assetAccount = transaction.assetType === 'equipment' ? 'Equipment' : 
                            transaction.assetType === 'property' ? 'Property' : 'Long-term Investments';
        
        addImpact(
          'balanceSheet',
          'assets',
          assetAccount,
          transaction.amount,
          `${assetAccount} acquired`
        );
        
        // Cash reduction
        addImpact(
          'balanceSheet',
          'assets',
          'Cash',
          -transaction.amount,
          `Cash used to purchase ${assetAccount.toLowerCase()}`
        );
        
        // Cash Flow Statement
        const cashFlowSection = transaction.assetType === 'investment' ? 'investing' : 'investing';
        const cashFlowAccount = transaction.assetType === 'investment' ? 'Investment Purchases' : 'Capital Expenditures';
        
        addImpact(
          'cashFlowStatement',
          cashFlowSection,
          cashFlowAccount,
          -transaction.amount,
          `Cash outflow for ${assetAccount.toLowerCase()} purchase`
        );
        break;
        
      case 'loan':
        // Balance Sheet - cash increases
        addImpact(
          'balanceSheet',
          'assets',
          'Cash',
          transaction.amount,
          'Cash received from loan'
        );
        
        // Debt increases
        const debtAccount = transaction.term === 'short-term' ? 'Short-term Debt' : 'Long-term Debt';
        addImpact(
          'balanceSheet',
          'liabilities',
          debtAccount,
          transaction.amount,
          `${debtAccount} liability created`
        );
        
        // Cash Flow Statement
        addImpact(
          'cashFlowStatement',
          'financing',
          'Debt Proceeds',
          transaction.amount,
          'Cash inflow from new debt'
        );
        break;
        
      case 'loan-payment':
        // Balance Sheet - cash decreases
        addImpact(
          'balanceSheet',
          'assets',
          'Cash',
          -transaction.amount,
          'Cash paid for loan payment'
        );
        
        // Split between principal and interest
        const principal = transaction.principal || transaction.amount * 0.8;
        const interest = transaction.interest || transaction.amount * 0.2;
        
        // Debt decreases by principal amount
        const loanAccount = transaction.term === 'short-term' ? 'Short-term Debt' : 'Long-term Debt';
        addImpact(
          'balanceSheet',
          'liabilities',
          loanAccount,
          -principal,
          `${loanAccount} reduced by principal payment`
        );
        
        // Income statement - interest expense
        addImpact(
          'incomeStatement',
          'expenses',
          'Interest Expense',
          -interest,
          'Interest paid on loan'
        );
        
        // Net Income impact from interest
        addImpact(
          'incomeStatement',
          'netIncome',
          'Net Income',
          -interest,
          'Interest expense reduces net income'
        );
        
        // Retained Earnings impact from interest
        addImpact(
          'balanceSheet',
          'equity',
          'Retained Earnings',
          -interest,
          'Interest expense reduces retained earnings'
        );
        
        // Cash Flow Statement
        addImpact(
          'cashFlowStatement',
          'financing',
          'Debt Repayment',
          -principal,
          'Principal repayment (financing activity)'
        );
        
        addImpact(
          'cashFlowStatement',
          'operations',
          'Interest Paid',
          -interest,
          'Interest payment (operating activity)'
        );
        break;
        
      case 'equity-investment':
        // Balance Sheet - cash increases
        addImpact(
          'balanceSheet',
          'assets',
          'Cash',
          transaction.amount,
          'Cash received from stock issuance'
        );
        
        // Equity increases
        addImpact(
          'balanceSheet',
          'equity',
          'Common Stock',
          transaction.amount,
          'Equity from stock issuance'
        );
        
        // Cash Flow Statement
        addImpact(
          'cashFlowStatement',
          'financing',
          'Stock Issuance',
          transaction.amount,
          'Cash inflow from issuing stock'
        );
        break;
        
      case 'dividend':
        // Balance Sheet - cash decreases
        addImpact(
          'balanceSheet',
          'assets',
          'Cash',
          -transaction.amount,
          'Cash paid as dividends'
        );
        
        // Equity decreases
        addImpact(
          'balanceSheet',
          'equity',
          'Retained Earnings',
          -transaction.amount,
          'Retained earnings reduced by dividends'
        );
        
        // Cash Flow Statement
        addImpact(
          'cashFlowStatement',
          'financing',
          'Dividends Paid',
          -transaction.amount,
          'Cash outflow for dividend payments'
        );
        break;
        
      case 'depreciation':
        // Income Statement - depreciation expense
        addImpact(
          'incomeStatement',
          'expenses',
          'Depreciation Expense',
          -transaction.amount,
          'Depreciation expense for period'
        );
        
        // Balance Sheet - accumulated depreciation
        addImpact(
          'balanceSheet',
          'assets',
          'Accumulated Depreciation',
          -transaction.amount,
          'Accumulated depreciation increases (contra-asset)'
        );
        
        // Net Income impact
        addImpact(
          'incomeStatement',
          'netIncome',
          'Net Income',
          -transaction.amount,
          'Depreciation reduces net income'
        );
        
        // Retained Earnings impact
        addImpact(
          'balanceSheet',
          'equity',
          'Retained Earnings',
          -transaction.amount,
          'Depreciation expense reduces retained earnings'
        );
        
        // Cash Flow Statement - add back depreciation (non-cash expense)
        addImpact(
          'cashFlowStatement',
          'operations',
          'Depreciation Adjustment',
          transaction.amount,
          'Non-cash expense added back to operating cash flow'
        );
        break;
        
      case 'custom':
        // Process custom transaction based on the affects array
        if (transaction.affects) {
          transaction.affects.forEach(effect => {
            const { statement, account, subAccount, change } = effect;
            
            if (statement === 'balanceSheet') {
              if (account === 'assets') {
                addImpact(
                  'balanceSheet',
                  'assets',
                  subAccount,
                  change,
                  `Custom change to ${subAccount}`
                );
              } else if (account === 'liabilities') {
                addImpact(
                  'balanceSheet',
                  'liabilities',
                  subAccount,
                  change,
                  `Custom change to ${subAccount}`
                );
              } else if (account === 'equity') {
                addImpact(
                  'balanceSheet',
                  'equity',
                  subAccount,
                  change,
                  `Custom change to ${subAccount}`
                );
              }
            } else if (statement === 'incomeStatement') {
              if (account === 'revenue') {
                addImpact(
                  'incomeStatement',
                  'revenue',
                  'Revenue',
                  change,
                  `Custom change to revenue`
                );
                
                // Net Income impact
                addImpact(
                  'incomeStatement',
                  'netIncome',
                  'Net Income',
                  change,
                  'Revenue affects net income'
                );
                
                // Retained Earnings impact
                addImpact(
                  'balanceSheet',
                  'equity',
                  'Retained Earnings',
                  change,
                  'Revenue affects retained earnings'
                );
              } else if (account === 'expenses' || account === 'costOfGoodsSold' || 
                         account === 'interestExpense' || account === 'taxExpense') {
                addImpact(
                  'incomeStatement',
                  'expenses',
                  subAccount || account,
                  change,
                  `Custom change to ${subAccount || account}`
                );
                
                // If it's an expense, it also affects net income and retained earnings
                if (change < 0) {
                  // Net Income impact
                  addImpact(
                    'incomeStatement',
                    'netIncome',
                    'Net Income',
                    change,
                    'Expense affects net income'
                  );
                  
                  // Retained Earnings impact
                  addImpact(
                    'balanceSheet',
                    'equity',
                    'Retained Earnings',
                    change,
                    'Expense affects retained earnings'
                  );
                }
              }
            } else if (statement === 'cashFlowStatement') {
              let section = 'operations';
              if (account === 'investingActivities') section = 'investing';
              if (account === 'financingActivities') section = 'financing';
              
              addImpact(
                'cashFlowStatement',
                section,
                subAccount,
                change,
                `Custom change to ${subAccount} in cash flow`
              );
            }
          });
        }
        break;
    }
    
    return result;
  }
  
  // Function to render the visualization
  function renderVisualization() {
    if (!svg || !transaction) return;
    
    // Process the transaction for visualization
    const processedData = processTransaction(transaction);
    if (!processedData) return;
    
    // Clear previous content
    d3.select(svg).selectAll('*').remove();
    
    // Create tooltip if it doesn't exist
    if (!tooltip) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'absolute p-3 bg-slate-800 text-white text-sm rounded-md shadow-lg max-w-xs invisible opacity-0 transition-opacity z-50')
        .style('pointer-events', 'none');
    }
    
    // Set up the SVG
    const svgEl = d3.select(svg)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Add title for the transaction
    svgEl.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text(`Transaction: ${transaction.name || 'Custom Transaction'}`);
    
    // Define statement dimensions
    const statementWidth = width / 3 - 30;
    const statementHeight = height - 100;
    const statementY = 60;
    
    // Define statement positions
    const statements = [
      { id: 'balanceSheet', name: 'Balance Sheet', x: 20, y: statementY, width: statementWidth, height: statementHeight },
      { id: 'incomeStatement', name: 'Income Statement', x: width / 3 + 10, y: statementY, width: statementWidth, height: statementHeight },
      { id: 'cashFlowStatement', name: 'Cash Flow Statement', x: 2 * width / 3, y: statementY, width: statementWidth, height: statementHeight }
    ];
    
    // Add the statements
    const statementGroups = svgEl.selectAll('.statement')
      .data(statements)
      .enter().append('g')
      .attr('class', 'statement')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // Add statement backgrounds
    statementGroups.append('rect')
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 6)
      .attr('fill', 'white')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1);
    
    // Add statement headers
    statementGroups.append('rect')
      .attr('width', d => d.width)
      .attr('height', 40)
      .attr('rx', 6)
      .attr('fill', d => colors[d.id].heading);
    
    statementGroups.append('text')
      .attr('x', d => d.width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => d.name);
    
    // Function to add section headers
    function addSectionHeader(statementGroup, statementId, sectionId, title, y, height) {
      const section = statementGroup.append('g')
        .attr('class', `section-${sectionId}`)
        .attr('transform', `translate(0, ${y})`);
      
      section.append('rect')
        .attr('width', statementWidth)
        .attr('height', height)
        .attr('fill', colors[statementId][sectionId])
        .attr('opacity', 0.7);
      
      section.append('text')
        .attr('x', 10)
        .attr('y', 25)
        .attr('fill', '#1e293b')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(title);
      
      return section;
    }
    
    // Add sections for each statement
    statements.forEach(statement => {
      const statementGroup = statementGroups.filter(d => d.id === statement.id);
      
      if (statement.id === 'balanceSheet') {
        // Assets Section
        const assetsSection = addSectionHeader(statementGroup, 'balanceSheet', 'assets', 'Assets', 50, 70);
        
        // Liabilities Section
        const liabilitiesSection = addSectionHeader(statementGroup, 'balanceSheet', 'liabilities', 'Liabilities', 130, 70);
        
        // Equity Section
        const equitySection = addSectionHeader(statementGroup, 'balanceSheet', 'equity', 'Equity', 210, 70);
        
        // Populate with transaction impacts
        if (processedData.statementSections.balanceSheet.assets.length > 0) {
          addImpactList(assetsSection, processedData.statementSections.balanceSheet.assets, 30);
        }
        
        if (processedData.statementSections.balanceSheet.liabilities.length > 0) {
          addImpactList(liabilitiesSection, processedData.statementSections.balanceSheet.liabilities, 30);
        }
        
        if (processedData.statementSections.balanceSheet.equity.length > 0) {
          addImpactList(equitySection, processedData.statementSections.balanceSheet.equity, 30);
        }
      }
      else if (statement.id === 'incomeStatement') {
        // Revenue Section
        const revenueSection = addSectionHeader(statementGroup, 'incomeStatement', 'revenue', 'Revenue', 50, 70);
        
        // Expenses Section
        const expensesSection = addSectionHeader(statementGroup, 'incomeStatement', 'expenses', 'Expenses', 130, 70);
        
        // Net Income Section
        const netIncomeSection = addSectionHeader(statementGroup, 'incomeStatement', 'netIncome', 'Net Income', 210, 70);
        
        // Populate with transaction impacts
        if (processedData.statementSections.incomeStatement.revenue.length > 0) {
          addImpactList(revenueSection, processedData.statementSections.incomeStatement.revenue, 30);
        }
        
        if (processedData.statementSections.incomeStatement.expenses.length > 0) {
          addImpactList(expensesSection, processedData.statementSections.incomeStatement.expenses, 30);
        }
        
        if (processedData.statementSections.incomeStatement.netIncome.length > 0) {
          addImpactList(netIncomeSection, processedData.statementSections.incomeStatement.netIncome, 30);
        }
      }
      else if (statement.id === 'cashFlowStatement') {
        // Operating Activities Section
        const operationsSection = addSectionHeader(statementGroup, 'cashFlowStatement', 'operations', 'Operating Activities', 50, 80);
        
        // Investing Activities Section
        const investingSection = addSectionHeader(statementGroup, 'cashFlowStatement', 'investing', 'Investing Activities', 140, 70);
        
        // Financing Activities Section
        const financingSection = addSectionHeader(statementGroup, 'cashFlowStatement', 'financing', 'Financing Activities', 220, 70);
        
        // Populate with transaction impacts
        if (processedData.statementSections.cashFlowStatement.operations.length > 0) {
          addImpactList(operationsSection, processedData.statementSections.cashFlowStatement.operations, 30);
        }
        
        if (processedData.statementSections.cashFlowStatement.investing.length > 0) {
          addImpactList(investingSection, processedData.statementSections.cashFlowStatement.investing, 30);
        }
        
        if (processedData.statementSections.cashFlowStatement.financing.length > 0) {
          addImpactList(financingSection, processedData.statementSections.cashFlowStatement.financing, 30);
        }
      }
    });
    
    // Add impact arrows for cross-statement impacts
    if (showImpacts) {
      addImpactArrows(svgEl, processedData.impacts, statements);
    }
  }
  
  function addImpactList(section, impacts, startY) {
    impacts.forEach((impact, index) => {
      const y = startY + index * 25;
      
      // Account name
      section.append('text')
        .attr('x', 20)
        .attr('y', y)
        .attr('fill', '#334155')
        .attr('font-size', '12px')
        .text(impact.account);
      
      // Amount with color based on increase/decrease
      section.append('text')
        .attr('x', statementWidth - 20)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .attr('fill', impact.changeType === 'increase' ? '#10b981' : 
                      impact.changeType === 'decrease' ? '#ef4444' : '#64748b')
        .attr('font-size', '12px')
        .attr('font-weight', 'medium')
        .text(formatCurrency(impact.amount));
      
      // Add info icon with tooltip
      const infoGroup = section.append('g')
        .attr('class', 'info-icon')
        .attr('transform', `translate(${statementWidth - 45}, ${y - 5})`)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          d3.select(this).select('circle')
            .attr('fill', '#3b82f6');
          
          tooltip
            .style('opacity', 1)
            .style('visibility', 'visible')
            .html(`
              <div>${impact.description}</div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).select('circle')
            .attr('fill', '#94a3b8');
          
          tooltip
            .style('opacity', 0)
            .style('visibility', 'hidden');
        });
      
      infoGroup.append('circle')
        .attr('r', 6)
        .attr('fill', '#94a3b8');
      
      infoGroup.append('text')
        .attr('x', 0)
        .attr('y', 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .text('i');
    });
  }
  
  function addImpactArrows(svg, impacts, statements) {
    // Create a map to track cross-statement impacts
    const crossImpacts = [];
    
    impacts.forEach(impact => {
      // For certain impacts, add cross-statement visualizations
      if (impact.account === 'Retained Earnings' && impact.statement === 'balanceSheet') {
        // Find the matching net income impact
        const netIncomeImpact = impacts.find(i => 
          i.account === 'Net Income' && i.statement === 'incomeStatement' && Math.abs(i.amount) === Math.abs(impact.amount)
        );
        
        if (netIncomeImpact) {
          crossImpacts.push({
            from: {
              statement: 'incomeStatement',
              section: 'netIncome',
              account: 'Net Income'
            },
            to: {
              statement: 'balanceSheet',
              section: 'equity',
              account: 'Retained Earnings'
            },
            amount: Math.abs(impact.amount),
            description: 'Net Income flows to Retained Earnings'
          });
        }
      }
      
      if (impact.account === 'Cash' && impact.changeType === 'increase' && impact.statement === 'balanceSheet') {
        // Find matching cash flow impact
        const cashFlowImpact = impacts.find(i => 
          i.statement === 'cashFlowStatement' && 
          (i.section === 'operations' || i.section === 'investing' || i.section === 'financing') &&
          Math.abs(i.amount) === Math.abs(impact.amount)
        );
        
        if (cashFlowImpact) {
          crossImpacts.push({
            from: {
              statement: 'cashFlowStatement',
              section: cashFlowImpact.section,
              account: cashFlowImpact.account
            },
            to: {
              statement: 'balanceSheet',
              section: 'assets',
              account: 'Cash'
            },
            amount: Math.abs(impact.amount),
            description: `Cash flow from ${cashFlowImpact.section} activities increases Cash`
          });
        }
      }
      
      if (impact.account === 'Cash' && impact.changeType === 'decrease' && impact.statement === 'balanceSheet') {
        // Find matching cash flow impact
        const cashFlowImpact = impacts.find(i => 
          i.statement === 'cashFlowStatement' && 
          (i.section === 'operations' || i.section === 'investing' || i.section === 'financing') &&
          Math.abs(i.amount) === Math.abs(impact.amount)
        );
        
        if (cashFlowImpact) {
          crossImpacts.push({
            from: {
              statement: 'balanceSheet',
              section: 'assets',
              account: 'Cash'
            },
            to: {
              statement: 'cashFlowStatement',
              section: cashFlowImpact.section,
              account: cashFlowImpact.account
            },
            amount: Math.abs(impact.amount),
            description: `Cash outflow recorded in ${cashFlowImpact.section} activities`
          });
        }
      }
      
      // Add more cross-statement relationships here
    });
    
    // Draw the arrows
    crossImpacts.forEach(impact => {
      const fromStatement = statements.find(s => s.id === impact.from.statement);
      const toStatement = statements.find(s => s.id === impact.to.statement);
      
      if (!fromStatement || !toStatement) return;
      
      // Calculate approximate positions
      const fromX = fromStatement.x + fromStatement.width;
      const fromY = fromStatement.y + 50 + (impact.from.section === 'netIncome' ? 210 : 
                                          impact.from.section === 'operations' ? 80 : 
                                          impact.from.section === 'investing' ? 160 : 
                                          impact.from.section === 'financing' ? 240 : 
                                          impact.from.section === 'assets' ? 80 : 
                                          impact.from.section === 'equity' ? 240 : 120);
      
      const toX = toStatement.x;
      const toY = toStatement.y + 50 + (impact.to.section === 'netIncome' ? 210 : 
                                      impact.to.section === 'operations' ? 80 : 
                                      impact.to.section === 'investing' ? 160 : 
                                      impact.to.section === 'financing' ? 240 : 
                                      impact.to.section === 'assets' ? 80 : 
                                      impact.to.section === 'equity' ? 240 : 120);
      
      // Create arrow path
      const arrowPath = d3.path();
      arrowPath.moveTo(fromX, fromY);
      
      // Create curved path
      const controlX = (fromX + toX) / 2;
      arrowPath.bezierCurveTo(
        controlX, fromY,
        controlX, toY,
        toX, toY
      );
      
      // Draw the path
      svg.append('path')
        .attr('d', arrowPath)
        .attr('fill', 'none')
        .attr('stroke', '#4b5563')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('marker-end', 'url(#arrow)');
      
      // Add an arrow marker definition
      if (!svg.select('defs').node()) {
        svg.append('defs');
      }
      
      if (!svg.select('#arrow').node()) {
        svg.select('defs')
          .append('marker')
          .attr('id', 'arrow')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 8)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#4b5563');
      }
      
      // Add a label with the amount
      svg.append('text')
        .attr('x', controlX)
        .attr('y', (fromY + toY) / 2 - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4b5563')
        .attr('font-size', '12px')
        .attr('font-weight', 'medium')
        .attr('paint-order', 'stroke')
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .text(formatCurrency(impact.amount).replace('+', ''));
    });
  }
  
  // Initialize visualization when component mounts
  onMount(() => {
    renderVisualization();
    
    // Cleanup tooltip on component destroy
    return () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    };
  });
  
  // Re-render when the transaction changes
  afterUpdate(() => {
    renderVisualization();
  });
</script>

<div class="w-full h-full flex flex-col overflow-hidden p-2">
  <div class="bg-white rounded-lg shadow-sm flex-grow overflow-hidden p-4">
    <svg bind:this={svg} width={width} height={height} class="max-w-full h-auto mx-auto">
      <!-- Diagram will be rendered here -->
    </svg>
  </div>
  
  {#if !transaction}
    <div class="flex items-center justify-center h-full text-slate-500">
      <p>Select a transaction to visualize its impact on financial statements</p>
    </div>
  {/if}
</div>

<style>
  /* Additional styling as needed */
</style>