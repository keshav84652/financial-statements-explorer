<script>
  import { financialData, financialRatios } from '../../stores/financialStore';
  import { BarChart, LineChart, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-svelte';
  import StatCard from '../ui/StatCard.svelte';
  import SimpleBarChart from '../charts/SimpleBarChart.svelte';
  import SimpleLineChart from '../charts/SimpleLineChart.svelte';
  import StatementFlowDiagram from '../charts/StatementFlowDiagram.svelte';
  
  // Derived metrics for the dashboard
  $: metrics = {
    revenue: $financialData.incomeStatement.revenue,
    profit: $financialData.incomeStatement.netIncome,
    assets: $financialData.balanceSheet.totalAssets,
    cashflow: $financialData.cashFlowStatement.netCashFlow,
    profitMargin: ($financialData.incomeStatement.netIncome / $financialData.incomeStatement.revenue) * 100,
    growth: 8.5, // Example growth rate - would be calculated from historical data in a real app
  };
  
  // Example time series data for charts
  const monthlyRevenue = [
    { month: 'Jan', value: 42000 },
    { month: 'Feb', value: 47000 },
    { month: 'Mar', value: 53000 },
    { month: 'Apr', value: 58000 },
    { month: 'May', value: 56000 },
    { month: 'Jun', value: 62000 },
  ];
  
  const quarterlyMetrics = [
    { quarter: 'Q1', revenue: 142000, expenses: 102000, profit: 40000 },
    { quarter: 'Q2', revenue: 176000, expenses: 123000, profit: 53000 },
    { quarter: 'Q3', revenue: 195000, expenses: 140000, profit: 55000 },
    { quarter: 'Q4', revenue: 215000, expenses: 157000, profit: 58000 },
  ];
  
  // Selected flow for highlighting in the diagram
  let highlightedFlow = null;
  
  // Handler for diagram section click
  const handleDiagramSectionClick = (flowId) => {
    highlightedFlow = highlightedFlow === flowId ? null : flowId;
  };
</script>

<div>
  <h1 class="text-2xl font-bold mb-6">Financial Dashboard</h1>
  
  <!-- Key metrics section -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard 
      title="Revenue" 
      value={`$${metrics.revenue.toLocaleString()}`} 
      change="+12.5%"
      trend="up"
      icon={DollarSign}
      color="bg-blue-500"
    />
    
    <StatCard 
      title="Net Profit" 
      value={`$${metrics.profit.toLocaleString()}`} 
      change="+8.3%"
      trend="up"
      icon={TrendingUp}
      color="bg-green-500"
    />
    
    <StatCard 
      title="Total Assets" 
      value={`$${metrics.assets.toLocaleString()}`} 
      change="+5.2%"
      trend="up"
      icon={BarChart}
      color="bg-purple-500"
    />
    
    <StatCard 
      title="Cash Flow" 
      value={`$${metrics.cashflow.toLocaleString()}`} 
      change="-3.1%"
      trend="down"
      icon={LineChart}
      color="bg-orange-500"
    />
  </div>
  
  <!-- Statement relationship diagram -->
  <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200 mb-8">
    <h3 class="text-lg font-semibold mb-4">Financial Statement Relationships</h3>
    <p class="text-slate-500 text-sm mb-4">
      This diagram illustrates how financial statements interconnect. Click on connections to highlight specific flows.
    </p>
    
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="lg:w-3/5">
        <div class="h-[400px]">
          <StatementFlowDiagram {highlightedFlow} height={400} />
        </div>
      </div>
      
      <div class="lg:w-2/5">
        <h4 class="text-md font-medium mb-3">Key Relationships</h4>
        
        <div class="space-y-3">
          <button 
            class="w-full text-left p-3 rounded-md border border-slate-200 transition hover:bg-slate-50"
            class:border-primary={highlightedFlow === 'netIncome'}
            class:bg-blue-50={highlightedFlow === 'netIncome'}
            on:click={() => handleDiagramSectionClick('netIncome')}
          >
            <div class="font-medium">
              Net Income → Retained Earnings
            </div>
            <div class="text-sm text-slate-500 mt-1">
              Net Income from the Income Statement increases Retained Earnings on the Balance Sheet
            </div>
          </button>
          
          <button 
            class="w-full text-left p-3 rounded-md border border-slate-200 transition hover:bg-slate-50"
            class:border-primary={highlightedFlow === 'netIncomeToOperatingCashFlow'}
            class:bg-blue-50={highlightedFlow === 'netIncomeToOperatingCashFlow'}
            on:click={() => handleDiagramSectionClick('netIncomeToOperatingCashFlow')}
          >
            <div class="font-medium">
              Net Income → Operating Cash Flow
            </div>
            <div class="text-sm text-slate-500 mt-1">
              Net Income is the starting point for the Cash Flow Statement, with non-cash items added back
            </div>
          </button>
          
          <button 
            class="w-full text-left p-3 rounded-md border border-slate-200 transition hover:bg-slate-50"
            class:border-primary={highlightedFlow === 'assetChangesToCashFlow'}
            class:bg-blue-50={highlightedFlow === 'assetChangesToCashFlow'}
            on:click={() => handleDiagramSectionClick('assetChangesToCashFlow')}
          >
            <div class="font-medium">
              Changes in Assets/Liabilities → Cash Flow
            </div>
            <div class="text-sm text-slate-500 mt-1">
              Changes in current assets and liabilities on the Balance Sheet affect Operating Cash Flow
            </div>
          </button>
          
          <button 
            class="w-full text-left p-3 rounded-md border border-slate-200 transition hover:bg-slate-50"
            class:border-primary={highlightedFlow === 'cashFlowToCash'}
            class:bg-blue-50={highlightedFlow === 'cashFlowToCash'}
            on:click={() => handleDiagramSectionClick('cashFlowToCash')}
          >
            <div class="font-medium">
              Net Cash Flow → Cash Balance
            </div>
            <div class="text-sm text-slate-500 mt-1">
              The net result of all cash flows updates the Cash account on the Balance Sheet
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Charts section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <h3 class="text-lg font-semibold mb-4">Revenue Trend</h3>
      <SimpleLineChart data={monthlyRevenue} />
    </div>
    
    <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <h3 class="text-lg font-semibold mb-4">Quarterly Performance</h3>
      <SimpleBarChart data={quarterlyMetrics} />
    </div>
  </div>
  
  <!-- Financial highlights -->
  <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200 mb-8">
    <h3 class="text-lg font-semibold mb-4">Financial Highlights</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="border-r border-slate-200 pr-6 last:border-r-0 last:pr-0">
        <h4 class="text-sm font-medium text-slate-500 mb-1">Profit Margin</h4>
        <div class="flex items-end">
          <span class="text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</span>
          <span class="flex items-center ml-2 text-sm text-green-600">
            <ArrowUpRight size={16} />
            2.1%
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-1">Above industry average</p>
      </div>
      
      <div class="border-r border-slate-200 pr-6 last:border-r-0 last:pr-0">
        <h4 class="text-sm font-medium text-slate-500 mb-1">Year-Over-Year Growth</h4>
        <div class="flex items-end">
          <span class="text-2xl font-bold">{metrics.growth.toFixed(1)}%</span>
          <span class="flex items-center ml-2 text-sm text-green-600">
            <ArrowUpRight size={16} />
            1.3%
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-1">Steady growth pattern</p>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-slate-500 mb-1">Debt to Equity</h4>
        <div class="flex items-end">
          <span class="text-2xl font-bold">0.54</span>
          <span class="flex items-center ml-2 text-sm text-red-600">
            <ArrowDownRight size={16} />
            0.06
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-1">Conservative leverage</p>
      </div>
    </div>
  </div>
  
  <!-- Recent transactions preview -->
  <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Recent Transactions</h3>
      <button class="text-primary text-sm font-medium">View All</button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-slate-500">Description</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-200">
            <td class="py-3 px-4 text-sm">Apr 10, 2025</td>
            <td class="py-3 px-4 text-sm">Sales Revenue</td>
            <td class="py-3 px-4 text-sm"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Income</span></td>
            <td class="py-3 px-4 text-sm text-right font-medium">$12,450</td>
          </tr>
          <tr class="border-b border-slate-200">
            <td class="py-3 px-4 text-sm">Apr 8, 2025</td>
            <td class="py-3 px-4 text-sm">Office Supplies</td>
            <td class="py-3 px-4 text-sm"><span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Expense</span></td>
            <td class="py-3 px-4 text-sm text-right font-medium">-$780</td>
          </tr>
          <tr class="border-b border-slate-200">
            <td class="py-3 px-4 text-sm">Apr 5, 2025</td>
            <td class="py-3 px-4 text-sm">Equipment Purchase</td>
            <td class="py-3 px-4 text-sm"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Asset</span></td>
            <td class="py-3 px-4 text-sm text-right font-medium">-$3,250</td>
          </tr>
          <tr class="border-b border-slate-200">
            <td class="py-3 px-4 text-sm">Apr 3, 2025</td>
            <td class="py-3 px-4 text-sm">Loan Payment</td>
            <td class="py-3 px-4 text-sm"><span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Liability</span></td>
            <td class="py-3 px-4 text-sm text-right font-medium">-$1,500</td>
          </tr>
          <tr>
            <td class="py-3 px-4 text-sm">Apr 1, 2025</td>
            <td class="py-3 px-4 text-sm">Consulting Services</td>
            <td class="py-3 px-4 text-sm"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Income</span></td>
            <td class="py-3 px-4 text-sm text-right font-medium">$5,800</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>