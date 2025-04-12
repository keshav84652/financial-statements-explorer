<script>
  import { onMount, afterUpdate } from 'svelte';
  import { financialData, financialRatios } from '../../stores/financialStore';
  import { goto } from '$app/navigation';
  import { HelpCircle, Plus, Minus, ChevronRight, ChevronDown } from 'lucide-svelte';
  
  export let interactive = true;
  export let showImpactOnChange = true;
  export let highlightedRatio = null;
  export let showAllRatios = false;
  
  let expanded = {
    liquidity: false,
    profitability: true,  // Show profitability by default
    solvency: false,
    efficiency: false
  };
  
  // Define ratio information
  const ratioInfo = {
    liquidity: {
      title: "Liquidity Ratios",
      description: "Liquidity ratios measure a company's ability to pay off short-term debts.",
      ratios: {
        currentRatio: {
          name: "Current Ratio",
          description: "Measures a company's ability to pay short-term obligations within one year.",
          formula: "Current Assets / Current Liabilities",
          interpretation: [
            { range: [0, 1], rating: "Poor", description: "The company may have difficulty meeting short-term obligations." },
            { range: [1, 1.5], rating: "Fair", description: "The company can meet short-term obligations, but with little margin of safety." },
            { range: [1.5, 3], rating: "Good", description: "The company has a healthy ability to pay short-term obligations." },
            { range: [3, Infinity], rating: "Excellent", description: "The company has a strong ability to pay short-term obligations, but may be inefficiently using assets." }
          ],
          components: {
            numerator: { 
              name: "Current Assets", 
              account: "balanceSheet.totalCurrentAssets",
              statement: "balanceSheet"
            },
            denominator: { 
              name: "Current Liabilities", 
              account: "balanceSheet.totalCurrentLiabilities",
              statement: "balanceSheet"
            }
          }
        },
        quickRatio: {
          name: "Quick Ratio",
          description: "A more conservative measure of liquidity that excludes inventory.",
          formula: "(Cash + Short-term Investments + Accounts Receivable) / Current Liabilities",
          interpretation: [
            { range: [0, 0.9], rating: "Poor", description: "The company may have difficulty meeting short-term obligations without selling inventory." },
            { range: [0.9, 1], rating: "Fair", description: "The company may be able to meet short-term obligations, but with little cushion." },
            { range: [1, 1.5], rating: "Good", description: "The company has a good ability to meet short-term obligations without relying on inventory." },
            { range: [1.5, Infinity], rating: "Excellent", description: "The company has a strong ability to meet short-term obligations without relying on inventory." }
          ],
          components: {
            numerator: { 
              name: "Quick Assets", 
              account: "balanceSheet.assets.currentAssets.cash + balanceSheet.assets.currentAssets.shortTermInvestments + balanceSheet.assets.currentAssets.accountsReceivable",
              statement: "balanceSheet"
            },
            denominator: { 
              name: "Current Liabilities", 
              account: "balanceSheet.totalCurrentLiabilities",
              statement: "balanceSheet"
            }
          }
        }
      }
    },
    profitability: {
      title: "Profitability Ratios",
      description: "Profitability ratios measure a company's ability to generate earnings relative to sales, assets, and equity.",
      ratios: {
        grossProfitMargin: {
          name: "Gross Profit Margin",
          description: "Measures how efficiently a company uses its materials and labor to produce and sell products.",
          formula: "Gross Profit / Revenue",
          interpretation: [
            { range: [0, 0.2], rating: "Poor", description: "The company has a low margin on its products or services." },
            { range: [0.2, 0.4], rating: "Fair", description: "The company has an acceptable margin on its products or services." },
            { range: [0.4, 0.6], rating: "Good", description: "The company has a good margin on its products or services." },
            { range: [0.6, Infinity], rating: "Excellent", description: "The company has an excellent margin on its products or services." }
          ],
          components: {
            numerator: { 
              name: "Gross Profit", 
              account: "incomeStatement.grossProfit",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Revenue", 
              account: "incomeStatement.revenue",
              statement: "incomeStatement"
            }
          }
        },
        netProfitMargin: {
          name: "Net Profit Margin",
          description: "Measures how much of each dollar of revenue is kept as profit after all expenses.",
          formula: "Net Income / Revenue",
          interpretation: [
            { range: [0, 0.05], rating: "Poor", description: "The company keeps less than 5% of revenue as profit." },
            { range: [0.05, 0.1], rating: "Fair", description: "The company keeps 5-10% of revenue as profit." },
            { range: [0.1, 0.2], rating: "Good", description: "The company keeps 10-20% of revenue as profit." },
            { range: [0.2, Infinity], rating: "Excellent", description: "The company keeps over 20% of revenue as profit." }
          ],
          components: {
            numerator: { 
              name: "Net Income", 
              account: "incomeStatement.netIncome",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Revenue", 
              account: "incomeStatement.revenue",
              statement: "incomeStatement"
            }
          }
        },
        returnOnAssets: {
          name: "Return on Assets (ROA)",
          description: "Measures how efficiently a company uses its assets to generate profit.",
          formula: "Net Income / Total Assets",
          interpretation: [
            { range: [0, 0.05], rating: "Poor", description: "The company is generating less than 5% return on its assets." },
            { range: [0.05, 0.1], rating: "Fair", description: "The company is generating 5-10% return on its assets." },
            { range: [0.1, 0.2], rating: "Good", description: "The company is generating 10-20% return on its assets." },
            { range: [0.2, Infinity], rating: "Excellent", description: "The company is generating over 20% return on its assets." }
          ],
          components: {
            numerator: { 
              name: "Net Income", 
              account: "incomeStatement.netIncome",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Total Assets", 
              account: "balanceSheet.totalAssets",
              statement: "balanceSheet"
            }
          }
        },
        returnOnEquity: {
          name: "Return on Equity (ROE)",
          description: "Measures how efficiently a company uses its equity to generate profit.",
          formula: "Net Income / Total Equity",
          interpretation: [
            { range: [0, 0.1], rating: "Poor", description: "The company is generating less than 10% return on shareholder equity." },
            { range: [0.1, 0.15], rating: "Fair", description: "The company is generating 10-15% return on shareholder equity." },
            { range: [0.15, 0.25], rating: "Good", description: "The company is generating 15-25% return on shareholder equity." },
            { range: [0.25, Infinity], rating: "Excellent", description: "The company is generating over 25% return on shareholder equity." }
          ],
          components: {
            numerator: { 
              name: "Net Income", 
              account: "incomeStatement.netIncome",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Total Equity", 
              account: "balanceSheet.totalEquity",
              statement: "balanceSheet"
            }
          }
        }
      }
    },
    solvency: {
      title: "Solvency Ratios",
      description: "Solvency ratios measure a company's ability to meet long-term obligations.",
      ratios: {
        debtToEquityRatio: {
          name: "Debt to Equity Ratio",
          description: "Measures the proportion of debt a company is using to finance its assets relative to its equity.",
          formula: "Total Liabilities / Total Equity",
          interpretation: [
            { range: [0, 0.5], rating: "Excellent", description: "The company has very low debt relative to equity." },
            { range: [0.5, 1], rating: "Good", description: "The company has a balanced debt to equity structure." },
            { range: [1, 2], rating: "Fair", description: "The company has more debt than equity, which may be a concern." },
            { range: [2, Infinity], rating: "Poor", description: "The company has significantly more debt than equity, which may indicate financial risk." }
          ],
          components: {
            numerator: { 
              name: "Total Liabilities", 
              account: "balanceSheet.totalLiabilities",
              statement: "balanceSheet"
            },
            denominator: { 
              name: "Total Equity", 
              account: "balanceSheet.totalEquity",
              statement: "balanceSheet"
            }
          }
        },
        debtToAssetsRatio: {
          name: "Debt to Assets Ratio",
          description: "Measures the percentage of a company's assets that are financed with debt.",
          formula: "Total Liabilities / Total Assets",
          interpretation: [
            { range: [0, 0.3], rating: "Excellent", description: "Less than 30% of the company's assets are financed with debt." },
            { range: [0.3, 0.5], rating: "Good", description: "30-50% of the company's assets are financed with debt." },
            { range: [0.5, 0.7], rating: "Fair", description: "50-70% of the company's assets are financed with debt." },
            { range: [0.7, Infinity], rating: "Poor", description: "Over 70% of the company's assets are financed with debt, indicating high leverage." }
          ],
          components: {
            numerator: { 
              name: "Total Liabilities", 
              account: "balanceSheet.totalLiabilities",
              statement: "balanceSheet"
            },
            denominator: { 
              name: "Total Assets", 
              account: "balanceSheet.totalAssets",
              statement: "balanceSheet"
            }
          }
        },
        interestCoverageRatio: {
          name: "Interest Coverage Ratio",
          description: "Measures how easily a company can pay interest on its outstanding debt.",
          formula: "Operating Income / Interest Expense",
          interpretation: [
            { range: [0, 1.5], rating: "Poor", description: "The company may have difficulty paying interest expenses." },
            { range: [1.5, 3], rating: "Fair", description: "The company can cover interest expenses, but with limited cushion." },
            { range: [3, 5], rating: "Good", description: "The company can comfortably cover interest expenses." },
            { range: [5, Infinity], rating: "Excellent", description: "The company can very easily cover interest expenses." }
          ],
          components: {
            numerator: { 
              name: "Operating Income", 
              account: "incomeStatement.operatingIncome",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Interest Expense", 
              account: "incomeStatement.interestExpense",
              statement: "incomeStatement"
            }
          }
        }
      }
    },
    efficiency: {
      title: "Efficiency Ratios",
      description: "Efficiency ratios measure how effectively a company uses its assets and manages its operations.",
      ratios: {
        inventoryTurnover: {
          name: "Inventory Turnover",
          description: "Measures how efficiently a company is using its inventory.",
          formula: "Cost of Goods Sold / Average Inventory",
          interpretation: [
            { range: [0, 3], rating: "Poor", description: "The company may have excess or obsolete inventory." },
            { range: [3, 6], rating: "Fair", description: "The company has average inventory management." },
            { range: [6, 10], rating: "Good", description: "The company has good inventory management." },
            { range: [10, Infinity], rating: "Excellent", description: "The company has excellent inventory management." }
          ],
          components: {
            numerator: { 
              name: "Cost of Goods Sold", 
              account: "incomeStatement.costOfGoodsSold",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Inventory", 
              account: "balanceSheet.assets.currentAssets.inventory",
              statement: "balanceSheet"
            }
          }
        },
        assetTurnover: {
          name: "Asset Turnover",
          description: "Measures how efficiently a company is using its assets to generate revenue.",
          formula: "Revenue / Total Assets",
          interpretation: [
            { range: [0, 0.5], rating: "Poor", description: "The company generates less than 50 cents of revenue for each dollar of assets." },
            { range: [0.5, 1], rating: "Fair", description: "The company generates 50 cents to 1 dollar of revenue for each dollar of assets." },
            { range: [1, 2], rating: "Good", description: "The company generates 1 to 2 dollars of revenue for each dollar of assets." },
            { range: [2, Infinity], rating: "Excellent", description: "The company generates more than 2 dollars of revenue for each dollar of assets." }
          ],
          components: {
            numerator: { 
              name: "Revenue", 
              account: "incomeStatement.revenue",
              statement: "incomeStatement"
            },
            denominator: { 
              name: "Total Assets", 
              account: "balanceSheet.totalAssets",
              statement: "balanceSheet"
            }
          }
        }
      }
    }
  };
  
  // Function to determine rating color
  function getRatingColor(rating) {
    switch(rating) {
      case "Excellent": return "text-emerald-600";
      case "Good": return "text-green-600";
      case "Fair": return "text-amber-600";
      case "Poor": return "text-red-600";
      default: return "text-slate-600";
    }
  }
  
  // Function to determine rating background
  function getRatingBg(rating) {
    switch(rating) {
      case "Excellent": return "bg-emerald-100";
      case "Good": return "bg-green-100";
      case "Fair": return "bg-amber-100";
      case "Poor": return "bg-red-100";
      default: return "bg-slate-100";
    }
  }
  
  // Function to format ratio as percentage
  function formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
  }
  
  // Function to format ratio as decimal
  function formatDecimal(value) {
    return value.toFixed(2);
  }
  
  // Function to determine if a ratio should be formatted as percentage
  function isPercentRatio(ratioId) {
    return ['grossProfitMargin', 'netProfitMargin', 'returnOnAssets', 'returnOnEquity', 'debtToAssetsRatio'].includes(ratioId);
  }
  
  // Function to format a ratio value
  function formatRatio(value, ratioId) {
    return isPercentRatio(ratioId) ? formatPercent(value) : formatDecimal(value);
  }
  
  // Function to determine rating for a ratio
  function getRating(value, interpretationGuide) {
    for (const guide of interpretationGuide) {
      if (value >= guide.range[0] && value < guide.range[1]) {
        return guide;
      }
    }
    return interpretationGuide[interpretationGuide.length - 1];
  }
  
  // Format currency values
  function formatCurrency(value) {
    return '$' + value.toLocaleString();
  }
  
  // Function to access a property using dot notation string
  function getPropertyByPath(obj, path) {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }
  
  // Function to evaluate mathematical expressions in component strings
  function evaluateExpression(expression, obj) {
    // Split the expression by + signs
    const parts = expression.split(' + ');
    
    // Calculate the sum
    return parts.reduce((sum, part) => {
      const value = getPropertyByPath(obj, part.trim());
      return sum + (value || 0);
    }, 0);
  }
  
  // Toggle the expanded state of a ratio category
  function toggleCategory(category) {
    expanded[category] = !expanded[category];
  }
  
  // Handle clicking on a specific ratio to highlight it
  function handleRatioClick(categoryId, ratioId) {
    if (interactive) {
      highlightedRatio = highlightedRatio === `${categoryId}.${ratioId}` ? null : `${categoryId}.${ratioId}`;
    }
  }
  
  // Create a demo transaction to show impact by modifying a component
  function createDemoTransaction(categoryId, ratioId, isNumerator, direction) {
    const ratio = ratioInfo[categoryId].ratios[ratioId];
    const component = isNumerator ? ratio.components.numerator : ratio.components.denominator;
    
    const account = component.account;
    const statement = component.statement;
    
    // Determine the amount based on the direction and component
    // We'll use 10% of the current value for demonstration
    const baseValue = evaluateExpression(account, $financialData);
    const changeAmount = baseValue * 0.1 * (direction === 'increase' ? 1 : -1);
    
    // Map to the proper statement and account structure
    // This is a simplified example - in a real app, you would map to the exact account structure
    let statementAccount, subAccount;
    
    if (account.includes('totalCurrentAssets')) {
      statementAccount = 'assets.currentAssets.cash'; // Example: increase cash to impact current assets
      subAccount = 'cash';
    } else if (account.includes('totalCurrentLiabilities')) {
      statementAccount = 'liabilities.currentLiabilities.accountsPayable'; // Example account
      subAccount = 'accountsPayable';
    } else if (account.includes('netIncome') || account.includes('grossProfit')) {
      // For income statement, we'll impact revenue
      statementAccount = 'revenue';
      subAccount = null;
    } else if (account.includes('totalAssets')) {
      statementAccount = 'assets.currentAssets.cash'; // Example: increase cash to impact total assets
      subAccount = 'cash';
    } else if (account.includes('totalEquity')) {
      statementAccount = 'equity.retainedEarnings'; // Example: retained earnings impacts equity
      subAccount = 'retainedEarnings';
    } else if (account.includes('totalLiabilities')) {
      statementAccount = 'liabilities.currentLiabilities.accountsPayable'; // Example account
      subAccount = 'accountsPayable';
    } else if (account.includes('interestExpense')) {
      statementAccount = 'interestExpense';
      subAccount = null;
    } else if (account.includes('operatingIncome')) {
      statementAccount = 'revenue'; // Example: increase revenue to impact operating income
      subAccount = null;
    } else if (account.includes('costOfGoodsSold')) {
      statementAccount = 'costOfGoodsSold';
      subAccount = null;
    } else if (account.includes('inventory')) {
      statementAccount = 'assets.currentAssets.inventory';
      subAccount = 'inventory';
    } else if (account.includes('revenue')) {
      statementAccount = 'revenue';
      subAccount = null;
    } else {
      // Default to cash for simplicity
      statementAccount = 'assets.currentAssets.cash';
      subAccount = 'cash';
    }
    
    // Create a transaction that affects the appropriate account
    const transaction = {
      type: 'custom',
      name: `${direction === 'increase' ? 'Increase' : 'Decrease'} ${component.name}`,
      amount: Math.abs(changeAmount),
      affects: []
    };
    
    // Map to the specific statement structure
    let effectStatement, effectAccount, effectSubAccount;
    
    if (statement === 'balanceSheet') {
      effectStatement = 'balanceSheet';
      
      // Handle the specific balance sheet account
      if (statementAccount.startsWith('assets')) {
        effectAccount = 'assets';
        effectSubAccount = subAccount;
      } else if (statementAccount.startsWith('liabilities')) {
        effectAccount = 'liabilities';
        effectSubAccount = subAccount;
      } else if (statementAccount.startsWith('equity')) {
        effectAccount = 'equity';
        effectSubAccount = subAccount;
      }
    } else if (statement === 'incomeStatement') {
      effectStatement = 'incomeStatement';
      
      if (statementAccount === 'revenue') {
        effectAccount = 'revenue';
        effectSubAccount = 'revenue';
      } else if (statementAccount === 'costOfGoodsSold') {
        effectAccount = 'costOfGoodsSold';
        effectSubAccount = 'costOfGoodsSold';
      } else if (statementAccount === 'interestExpense') {
        effectAccount = 'interestExpense';
        effectSubAccount = 'interestExpense';
      } else {
        effectAccount = 'operatingExpenses';
        effectSubAccount = 'other';
      }
    }
    
    // Add the effect to the transaction
    transaction.affects.push({
      statement: effectStatement,
      account: effectAccount,
      subAccount: effectSubAccount,
      change: changeAmount
    });
    
    return transaction;
  }
</script>

<div class="bg-white rounded-lg shadow-sm p-4">
  <h2 class="text-xl font-bold mb-4">Financial Ratios Explorer</h2>
  
  <div class="space-y-6">
    <!-- Loop through each ratio category -->
    {#each Object.entries(ratioInfo) as [categoryId, category]}
      <div class="border rounded-lg overflow-hidden">
        <!-- Category header -->
        <button 
          class="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
          on:click={() => toggleCategory(categoryId)}
        >
          <div class="flex items-center">
            {#if expanded[categoryId]}
              <ChevronDown class="mr-2 text-slate-500" size={18} />
            {:else}
              <ChevronRight class="mr-2 text-slate-500" size={18} />
            {/if}
            <h3 class="font-semibold">{category.title}</h3>
          </div>
        </button>
        
        <!-- Category content (conditionally shown) -->
        {#if expanded[categoryId] || showAllRatios}
          <div class="p-4 bg-white">
            <p class="text-slate-600 mb-4">{category.description}</p>
            
            <!-- Loop through ratios in this category -->
            <div class="space-y-6">
              {#each Object.entries(category.ratios) as [ratioId, ratio]}
                {@const isHighlighted = highlightedRatio === `${categoryId}.${ratioId}`}
                {@const ratioValue = $financialRatios[categoryId][ratioId]}
                {@const ratingInfo = getRating(ratioValue, ratio.interpretation)}
                
                <div 
                  class="border rounded-lg p-4 transition" 
                  class:bg-blue-50={isHighlighted}
                  class:border-blue-300={isHighlighted}
                  class:shadow-sm={isHighlighted}
                >
                  <!-- Ratio header -->
                  <div 
                    class="flex justify-between items-start cursor-pointer"
                    on:click={() => handleRatioClick(categoryId, ratioId)}
                  >
                    <div>
                      <h4 class="font-semibold text-lg">{ratio.name}</h4>
                      <p class="text-slate-600 text-sm">{ratio.description}</p>
                    </div>
                    
                    <div class="flex flex-col items-end">
                      <div class="text-xl font-bold">
                        {formatRatio(ratioValue, ratioId)}
                      </div>
                      <div class={`text-sm font-medium px-2 py-1 rounded-full ${getRatingBg(ratingInfo.rating)} ${getRatingColor(ratingInfo.rating)}`}>
                        {ratingInfo.rating}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Extended ratio information (shown when highlighted) -->
                  {#if isHighlighted}
                    <div class="mt-4 pt-4 border-t">
                      <div class="mb-4">
                        <div class="font-medium text-slate-700">Formula:</div>
                        <div class="px-3 py-2 bg-slate-50 rounded mt-1 font-mono text-sm">
                          {ratio.formula}
                        </div>
                      </div>
                      
                      <div class="mb-4">
                        <div class="font-medium text-slate-700">Calculation:</div>
                        <div class="grid grid-cols-1 gap-2 mt-2">
                          <!-- Numerator -->
                          <div class="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <div>
                              <span class="font-medium">{ratio.components.numerator.name}:</span> 
                              <span class="ml-2">{formatCurrency(evaluateExpression(ratio.components.numerator.account, $financialData))}</span>
                            </div>
                            
                            {#if interactive && showImpactOnChange}
                              <div class="flex space-x-1">
                                <button 
                                  class="p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
                                  title="Decrease this value to see the impact"
                                  on:click|stopPropagation={() => {
                                    const transaction = createDemoTransaction(categoryId, ratioId, true, 'decrease');
                                    $financialData.recordTransaction(transaction);
                                  }}
                                >
                                  <Minus size={14} />
                                </button>
                                <button 
                                  class="p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
                                  title="Increase this value to see the impact"
                                  on:click|stopPropagation={() => {
                                    const transaction = createDemoTransaction(categoryId, ratioId, true, 'increase');
                                    $financialData.recordTransaction(transaction);
                                  }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            {/if}
                          </div>
                          
                          <!-- Division symbol -->
                          <div class="flex justify-center items-center">
                            <div class="w-8 border-t-2 border-slate-400"></div>
                          </div>
                          
                          <!-- Denominator -->
                          <div class="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <div>
                              <span class="font-medium">{ratio.components.denominator.name}:</span> 
                              <span class="ml-2">{formatCurrency(evaluateExpression(ratio.components.denominator.account, $financialData))}</span>
                            </div>
                            
                            {#if interactive && showImpactOnChange}
                              <div class="flex space-x-1">
                                <button 
                                  class="p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
                                  title="Decrease this value to see the impact"
                                  on:click|stopPropagation={() => {
                                    const transaction = createDemoTransaction(categoryId, ratioId, false, 'decrease');
                                    $financialData.recordTransaction(transaction);
                                  }}
                                >
                                  <Minus size={14} />
                                </button>
                                <button 
                                  class="p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
                                  title="Increase this value to see the impact"
                                  on:click|stopPropagation={() => {
                                    const transaction = createDemoTransaction(categoryId, ratioId, false, 'increase');
                                    $financialData.recordTransaction(transaction);
                                  }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            {/if}
                          </div>
                          
                          <!-- Result -->
                          <div class="flex justify-between items-center p-3 bg-blue-50 rounded mt-2">
                            <span class="font-medium">Result:</span>
                            <span class="font-bold">{formatRatio(ratioValue, ratioId)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-4">
                        <div class="font-medium text-slate-700">Interpretation:</div>
                        <div class="mt-1 text-sm">
                          {ratingInfo.description}
                        </div>
                        
                        <!-- Rating scale visualization -->
                        <div class="mt-3">
                          <div class="flex items-center text-xs">
                            <div class="flex-1 text-left">Poor</div>
                            <div class="flex-1 text-center">Fair</div>
                            <div class="flex-1 text-center">Good</div>
                            <div class="flex-1 text-right">Excellent</div>
                          </div>
                          <div class="h-3 flex rounded-full overflow-hidden mt-1">
                            {@const thresholds = ratio.interpretation.map(r => r.range[0])}
                            {@const total = thresholds[thresholds.length-1] * 2 || 5}
                            
                            <!-- Poor section (red) -->
                            <div 
                              class="bg-red-400 h-full" 
                              style="width: {(thresholds[1] / total) * 100}%;"
                            ></div>
                            
                            <!-- Fair section (amber) -->
                            <div 
                              class="bg-amber-400 h-full" 
                              style="width: {((thresholds[2] - thresholds[1]) / total) * 100}%;"
                            ></div>
                            
                            <!-- Good section (green) -->
                            <div 
                              class="bg-green-400 h-full" 
                              style="width: {((thresholds[3] - thresholds[2]) / total) * 100}%;"
                            ></div>
                            
                            <!-- Excellent section (emerald) -->
                            <div 
                              class="bg-emerald-400 h-full" 
                              style="width: {((total - thresholds[3]) / total) * 100}%;"
                            ></div>
                          </div>
                          
                          <!-- Current value marker -->
                          <div class="relative h-0">
                            {@const markerPosition = Math.min(ratioValue / total, 0.98) * 100}
                            <div 
                              class="absolute top-0 transform -translate-x-1/2 -mt-5"
                              style="left: {markerPosition}%"
                            >
                              <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-800 mx-auto"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {#if interactive}
                        <div class="flex justify-end mt-4">
                          <button 
                            class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                            on:click|stopPropagation={() => {
                              // Navigate to the learning center with this ratio highlighted
                              // Example implementation - in a real app, this would navigate to a specific page
                              goto('/learning-center?topic=financial-ratios&ratio=' + ratioId);
                            }}
                          >
                            <span>Learn more about {ratio.name}</span>
                            <ChevronRight size={16} class="ml-1" />
                          </button>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  {#if interactive}
    <div class="mt-6 p-4 bg-blue-50 rounded-lg flex items-start">
      <HelpCircle class="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
      <div>
        <p class="text-sm text-slate-700">
          <span class="font-medium">How to use:</span> Click on any ratio to see detailed information about its calculation and interpretation. Use the + and - buttons to see how changes to specific accounts affect the ratio.
        </p>
        {#if showImpactOnChange}
          <p class="text-sm text-slate-700 mt-2">
            <span class="font-medium">Note:</span> Changes made here are real changes to the financial data. You can use the Undo button to revert changes.
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>