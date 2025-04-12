<script>
  import { financialData } from '../../stores/financialStore';
  import { currentStatement } from '../../stores/uiStore';
  import StatementTable from '../ui/StatementTable.svelte';
  import { LucideDownload, Info, ArrowLeftRight } from 'lucide-svelte';
  import StatementFlowDiagram from '../charts/StatementFlowDiagram.svelte';
  
  let activeTab = 'tables'; // 'tables' or 'visual'
  let showExplanations = true;
  let highlightedFlow = null;
  
  // Descriptions for each statement
  const statements = {
    'balance-sheet': {
      title: 'Balance Sheet',
      description: 'The Balance Sheet shows the company\'s financial position at a specific point in time. It lists assets, liabilities, and shareholders\' equity, following the equation: Assets = Liabilities + Equity.',
      tab: 'balance-sheet'
    },
    'income-statement': {
      title: 'Income Statement',
      description: 'The Income Statement (Profit & Loss) shows revenues, expenses, and resulting profit or loss over a period of time. It measures financial performance by calculating the net income.',
      tab: 'income-statement'
    },
    'cash-flow-statement': {
      title: 'Cash Flow Statement',
      description: 'The Cash Flow Statement tracks the inflow and outflow of cash from operating, investing, and financing activities. It shows how the company generates and uses cash during a specific period.',
      tab: 'cash-flow-statement'
    }
  };
  
  // Handle tab click
  const handleTabClick = (tab) => {
    currentStatement.set(tab);
  };
  
  // Handle statement sections click in visual view
  const handleStatementClick = (id) => {
    highlightedFlow = highlightedFlow === id ? null : id;
  };
  
  // Download statement as CSV
  const downloadStatement = () => {
    let content = '';
    let filename = '';
    
    // Prepare different content based on current statement
    if ($currentStatement === 'balance-sheet') {
      content = 'Balance Sheet\n\nAssets:\n';
      // Add assets
      Object.entries($financialData.balanceSheet.assets.currentAssets).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      Object.entries($financialData.balanceSheet.assets.nonCurrentAssets).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Assets,${$financialData.balanceSheet.totalAssets}\n\n`;
      
      // Add liabilities
      content += 'Liabilities:\n';
      Object.entries($financialData.balanceSheet.liabilities.currentLiabilities).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      Object.entries($financialData.balanceSheet.liabilities.nonCurrentLiabilities).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Liabilities,${$financialData.balanceSheet.totalLiabilities}\n\n`;
      
      // Add equity
      content += 'Equity:\n';
      Object.entries($financialData.balanceSheet.equity).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Equity,${$financialData.balanceSheet.totalEquity}\n`;
      
      filename = 'balance-sheet.csv';
    } 
    else if ($currentStatement === 'income-statement') {
      content = 'Income Statement\n\n';
      content += `Revenue,${$financialData.incomeStatement.revenue}\n`;
      content += `Cost of Goods Sold,${$financialData.incomeStatement.costOfGoodsSold}\n`;
      content += `Gross Profit,${$financialData.incomeStatement.grossProfit}\n\n`;
      
      content += 'Operating Expenses:\n';
      Object.entries($financialData.incomeStatement.operatingExpenses).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Operating Expenses,${$financialData.incomeStatement.totalOperatingExpenses}\n\n`;
      
      content += `Operating Income,${$financialData.incomeStatement.operatingIncome}\n`;
      content += `Other Income,${$financialData.incomeStatement.otherIncome}\n`;
      content += `Interest Expense,${$financialData.incomeStatement.interestExpense}\n`;
      content += `Income Before Tax,${$financialData.incomeStatement.incomeBeforeTax}\n`;
      content += `Tax Expense,${$financialData.incomeStatement.taxExpense}\n`;
      content += `Net Income,${$financialData.incomeStatement.netIncome}\n`;
      
      filename = 'income-statement.csv';
    }
    else if ($currentStatement === 'cash-flow-statement') {
      content = 'Cash Flow Statement\n\n';
      content += 'Operating Activities:\n';
      Object.entries($financialData.cashFlowStatement.operatingActivities).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Operating Cash Flow,${$financialData.cashFlowStatement.totalOperatingCashFlow}\n\n`;
      
      content += 'Investing Activities:\n';
      Object.entries($financialData.cashFlowStatement.investingActivities).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Investing Cash Flow,${$financialData.cashFlowStatement.totalInvestingCashFlow}\n\n`;
      
      content += 'Financing Activities:\n';
      Object.entries($financialData.cashFlowStatement.financingActivities).forEach(([key, value]) => {
        content += `${key},${value}\n`;
      });
      content += `Total Financing Cash Flow,${$financialData.cashFlowStatement.totalFinancingCashFlow}\n\n`;
      
      content += `Net Cash Flow,${$financialData.cashFlowStatement.netCashFlow}\n`;
      
      filename = 'cash-flow-statement.csv';
    }
    
    // Create and download the file
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Financial Statements</h1>
    
    <!-- View toggle -->
    <div class="flex">
      <button 
        class="px-4 py-2 flex items-center rounded-l-md border border-slate-300 transition"
        class:bg-primary={activeTab === 'tables'} 
        class:text-white={activeTab === 'tables'}
        class:bg-white={activeTab !== 'tables'}
        on:click={() => activeTab = 'tables'}
      >
        Tables
      </button>
      <button 
        class="px-4 py-2 flex items-center rounded-r-md border border-slate-300 border-l-0 transition"
        class:bg-primary={activeTab === 'visual'} 
        class:text-white={activeTab === 'visual'}
        class:bg-white={activeTab !== 'visual'}
        on:click={() => activeTab = 'visual'}
      >
        Visual
      </button>
    </div>
  </div>
  
  {#if activeTab === 'tables'}
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Statement selector sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 class="text-lg font-semibold mb-4">Statements</h3>
          
          <div class="space-y-2">
            {#each Object.entries(statements) as [key, statement]}
              <button 
                class="w-full p-3 text-left rounded-md transition border"
                class:border-primary={$currentStatement === key}
                class:bg-blue-50={$currentStatement === key}
                class:border-slate-200={$currentStatement !== key}
                class:hover:bg-slate-50={$currentStatement !== key}
                on:click={() => handleTabClick(key)}
              >
                <span class="font-medium">{statement.title}</span>
              </button>
            {/each}
          </div>
          
          <div class="mt-6">
            <button 
              class="w-full flex items-center justify-center py-2 px-4 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
              on:click={downloadStatement}
            >
              <LucideDownload size={18} class="mr-2" />
              Download as CSV
            </button>
          </div>
          
          <div class="mt-4">
            <button 
              class="w-full flex items-center justify-center py-2 px-4 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
              on:click={() => showExplanations = !showExplanations}
            >
              <Info size={18} class="mr-2" />
              {showExplanations ? 'Hide Explanations' : 'Show Explanations'}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Statement content -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {#each Object.entries(statements) as [key, statement]}
            {#if $currentStatement === key}
              <div>
                <h2 class="text-xl font-bold mb-2">{statement.title}</h2>
                
                {#if showExplanations}
                  <div class="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                    <p class="text-slate-700">{statement.description}</p>
                  </div>
                {/if}
                
                {#if key === 'balance-sheet'}
                  <!-- Balance Sheet -->
                  <div class="statement-section">
                    <StatementTable
                      title="Assets"
                      data={$financialData.balanceSheet.assets}
                    />
                  </div>
                  
                  <div class="statement-section">
                    <StatementTable
                      title="Liabilities"
                      data={$financialData.balanceSheet.liabilities}
                    />
                  </div>
                  
                  <div class="statement-section">
                    <StatementTable
                      title="Equity"
                      data={$financialData.balanceSheet.equity}
                    />
                  </div>
                  
                  <div class="statement-section bg-slate-50">
                    <table class="statement-table">
                      <tr class="total">
                        <td class="font-bold">Total Assets</td>
                        <td class="text-right font-bold">${$financialData.balanceSheet.totalAssets.toLocaleString()}</td>
                      </tr>
                      <tr class="total">
                        <td class="font-bold">Total Liabilities and Equity</td>
                        <td class="text-right font-bold">${($financialData.balanceSheet.totalLiabilities + $financialData.balanceSheet.totalEquity).toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                {:else if key === 'income-statement'}
                  <!-- Income Statement -->
                  <div class="statement-section">
                    <table class="statement-table">
                      <tr>
                        <td>Revenue</td>
                        <td class="text-right">${$financialData.incomeStatement.revenue.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Cost of Goods Sold</td>
                        <td class="text-right text-red-600">-${$financialData.incomeStatement.costOfGoodsSold.toLocaleString()}</td>
                      </tr>
                      <tr class="total">
                        <td class="font-bold">Gross Profit</td>
                        <td class="text-right font-bold">${$financialData.incomeStatement.grossProfit.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="statement-section">
                    <StatementTable
                      title="Operating Expenses"
                      data={$financialData.incomeStatement.operatingExpenses}
                      isNegative={true}
                    />
                    
                    <table class="statement-table mt-4">
                      <tr class="total">
                        <td class="font-bold">Total Operating Expenses</td>
                        <td class="text-right font-bold text-red-600">-${$financialData.incomeStatement.totalOperatingExpenses.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="statement-section">
                    <table class="statement-table">
                      <tr class="total">
                        <td class="font-bold">Operating Income</td>
                        <td class="text-right font-bold">${$financialData.incomeStatement.operatingIncome.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Other Income</td>
                        <td class="text-right">${$financialData.incomeStatement.otherIncome.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Interest Expense</td>
                        <td class="text-right text-red-600">-${$financialData.incomeStatement.interestExpense.toLocaleString()}</td>
                      </tr>
                      <tr class="total">
                        <td class="font-bold">Income Before Tax</td>
                        <td class="text-right font-bold">${$financialData.incomeStatement.incomeBeforeTax.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Tax Expense</td>
                        <td class="text-right text-red-600">-${$financialData.incomeStatement.taxExpense.toLocaleString()}</td>
                      </tr>
                      <tr class="total">
                        <td class="font-bold">Net Income</td>
                        <td class="text-right font-bold">${$financialData.incomeStatement.netIncome.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                
                {:else if key === 'cash-flow-statement'}
                  <!-- Cash Flow Statement -->
                  <div class="statement-section">
                    <StatementTable
                      title="Operating Activities"
                      data={$financialData.cashFlowStatement.operatingActivities}
                    />
                    
                    <table class="statement-table mt-4">
                      <tr class="total">
                        <td class="font-bold">Net Cash from Operating Activities</td>
                        <td class="text-right font-bold">${$financialData.cashFlowStatement.totalOperatingCashFlow.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="statement-section">
                    <StatementTable
                      title="Investing Activities"
                      data={$financialData.cashFlowStatement.investingActivities}
                    />
                    
                    <table class="statement-table mt-4">
                      <tr class="total">
                        <td class="font-bold">Net Cash from Investing Activities</td>
                        <td class="text-right font-bold">${$financialData.cashFlowStatement.totalInvestingCashFlow.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="statement-section">
                    <StatementTable
                      title="Financing Activities"
                      data={$financialData.cashFlowStatement.financingActivities}
                    />
                    
                    <table class="statement-table mt-4">
                      <tr class="total">
                        <td class="font-bold">Net Cash from Financing Activities</td>
                        <td class="text-right font-bold">${$financialData.cashFlowStatement.totalFinancingCashFlow.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="statement-section bg-slate-50">
                    <table class="statement-table">
                      <tr class="total">
                        <td class="font-bold">Net Increase/Decrease in Cash</td>
                        <td class="text-right font-bold">${$financialData.cashFlowStatement.netCashFlow.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <!-- Visual representation -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 class="text-xl font-bold mb-4">Visual Representation</h2>
      
      {#if showExplanations}
        <div class="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
          <p class="text-slate-700">
            This diagram shows how financial statements interact with each other. See how changes in one statement affect the others. 
            Click on the connections or the boxes below to highlight specific relationships.
          </p>
        </div>
      {/if}
      
      <div class="h-[500px] mb-6">
        <StatementFlowDiagram {highlightedFlow} height={500} />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border border-slate-200 rounded-md">
          <h3 class="font-medium text-lg mb-2">Income Statement</h3>
          <p class="text-sm text-slate-600 mb-4">Shows revenue, expenses, and profit over a period of time.</p>
          <div class="space-y-2">
            <button 
              class="w-full p-2 text-left text-sm rounded border border-slate-200 hover:bg-slate-50"
              class:border-primary={highlightedFlow === 'netIncome'}
              class:bg-blue-50={highlightedFlow === 'netIncome'}
              on:click={() => handleStatementClick('netIncome')}
            >
              Net Income → Balance Sheet
            </button>
            <button 
              class="w-full p-2 text-left text-sm rounded border border-slate-200 hover:bg-slate-50"
              class:border-primary={highlightedFlow === 'netIncomeToOperatingCashFlow'}
              class:bg-blue-50={highlightedFlow === 'netIncomeToOperatingCashFlow'}
              on:click={() => handleStatementClick('netIncomeToOperatingCashFlow')}
            >
              Net Income → Cash Flow Statement
            </button>
          </div>
        </div>
        
        <div class="p-4 border border-slate-200 rounded-md">
          <h3 class="font-medium text-lg mb-2">Balance Sheet</h3>
          <p class="text-sm text-slate-600 mb-4">Shows assets, liabilities, and equity at a point in time.</p>
          <div class="space-y-2">
            <button 
              class="w-full p-2 text-left text-sm rounded border border-slate-200 hover:bg-slate-50"
              class:border-primary={highlightedFlow === 'assetChangesToCashFlow'}
              class:bg-blue-50={highlightedFlow === 'assetChangesToCashFlow'}
              on:click={() => handleStatementClick('assetChangesToCashFlow')}
            >
              Asset Changes → Cash Flow Statement
            </button>
            <button 
              class="w-full p-2 text-left text-sm rounded border border-slate-200 hover:bg-slate-50"
              class:border-primary={highlightedFlow === 'cashFlowToCash'}
              class:bg-blue-50={highlightedFlow === 'cashFlowToCash'}
              on:click={() => handleStatementClick('cashFlowToCash')}
            >
              Cash Flow → Cash Balance
            </button>
          </div>
        </div>
        
        <div class="p-4 border border-slate-200 rounded-md">
          <h3 class="font-medium text-lg mb-2">Cash Flow Statement</h3>
          <p class="text-sm text-slate-600 mb-4">Shows cash inflows and outflows during a period.</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2 text-center bg-blue-100 rounded">
              <div class="text-sm font-medium">Operating</div>
              <div class="text-lg">${$financialData.cashFlowStatement.totalOperatingCashFlow.toLocaleString()}</div>
            </div>
            <div class="p-2 text-center bg-green-100 rounded">
              <div class="text-sm font-medium">Investing</div>
              <div class="text-lg">${$financialData.cashFlowStatement.totalInvestingCashFlow.toLocaleString()}</div>
            </div>
            <div class="p-2 text-center bg-purple-100 rounded">
              <div class="text-sm font-medium">Financing</div>
              <div class="text-lg">${$financialData.cashFlowStatement.totalFinancingCashFlow.toLocaleString()}</div>
            </div>
            <div class="p-2 text-center bg-slate-100 rounded">
              <div class="text-sm font-medium">Net Cash</div>
              <div class="text-lg">${$financialData.cashFlowStatement.netCashFlow.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>