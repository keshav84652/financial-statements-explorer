import { writable, derived } from 'svelte/store';

// Create a writable store for our financial data model
const createFinancialDataStore = () => {
  // Initial state
  const initialState = {
    balanceSheet: {
      assets: {
        currentAssets: {
          cash: 50000,
          accountsReceivable: 25000,
          inventory: 30000,
          prepaidExpenses: 5000,
          shortTermInvestments: 10000
        },
        nonCurrentAssets: {
          property: 150000,
          equipment: 75000,
          accumulatedDepreciation: -25000,
          longTermInvestments: 40000,
          intangibleAssets: 15000
        }
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: 20000,
          shortTermDebt: 10000,
          accruedExpenses: 8000,
          deferredRevenue: 5000,
          taxesPayable: 7000
        },
        nonCurrentLiabilities: {
          longTermDebt: 100000,
          deferredTaxLiabilities: 15000,
          pensionLiabilities: 20000
        }
      },
      equity: {
        commonStock: 80000,
        retainedEarnings: 60000,
        additionalPaidInCapital: 40000,
        treasuryStock: -15000
      }
    },
    incomeStatement: {
      revenue: 200000,
      costOfGoodsSold: 100000,
      operatingExpenses: {
        salaries: 40000,
        rent: 15000,
        utilities: 5000,
        marketing: 10000,
        depreciation: 7500,
        other: 12500
      },
      otherIncome: 5000,
      interestExpense: 7500,
      taxExpense: 10000
    },
    cashFlowStatement: {
      operatingActivities: {
        netIncome: 0, // Calculated
        depreciation: 7500,
        changeInInventory: -5000,
        changeInAccountsReceivable: -3000,
        changeInAccountsPayable: 2000,
        changeInAccruedExpenses: 1500,
        otherOperatingAdjustments: 1000
      },
      investingActivities: {
        purchaseOfEquipment: -15000,
        purchaseOfInvestments: -5000,
        saleOfInvestments: 2000
      },
      financingActivities: {
        debtRepayment: -10000,
        dividendsPaid: -5000,
        issuanceOfStock: 0
      }
    },
    transactions: [],
    history: [] // For tracking statement changes over time
  };

  // Create the store
  const { subscribe, set, update } = writable(initialState);

  // Calculate derived values
  const calculateDerivedValues = (state) => {
    // Balance Sheet calculations
    const totalCurrentAssets = Object.values(state.balanceSheet.assets.currentAssets).reduce((a, b) => a + b, 0);
    const totalNonCurrentAssets = Object.values(state.balanceSheet.assets.nonCurrentAssets).reduce((a, b) => a + b, 0);
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
    
    const totalCurrentLiabilities = Object.values(state.balanceSheet.liabilities.currentLiabilities).reduce((a, b) => a + b, 0);
    const totalNonCurrentLiabilities = Object.values(state.balanceSheet.liabilities.nonCurrentLiabilities).reduce((a, b) => a + b, 0);
    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
    
    const totalEquity = Object.values(state.balanceSheet.equity).reduce((a, b) => a + b, 0);
    
    // Income Statement calculations
    const grossProfit = state.incomeStatement.revenue - state.incomeStatement.costOfGoodsSold;
    const totalOperatingExpenses = Object.values(state.incomeStatement.operatingExpenses).reduce((a, b) => a + b, 0);
    const operatingIncome = grossProfit - totalOperatingExpenses;
    const incomeBeforeTax = operatingIncome + state.incomeStatement.otherIncome - state.incomeStatement.interestExpense;
    const netIncome = incomeBeforeTax - state.incomeStatement.taxExpense;
    
    // Cash Flow Statement calculations
    const totalOperatingCashFlow = netIncome + 
      state.cashFlowStatement.operatingActivities.depreciation +
      state.cashFlowStatement.operatingActivities.changeInInventory +
      state.cashFlowStatement.operatingActivities.changeInAccountsReceivable +
      state.cashFlowStatement.operatingActivities.changeInAccountsPayable +
      state.cashFlowStatement.operatingActivities.changeInAccruedExpenses +
      state.cashFlowStatement.operatingActivities.otherOperatingAdjustments;
    
    const totalInvestingCashFlow = Object.values(state.cashFlowStatement.investingActivities).reduce((a, b) => a + b, 0);
    const totalFinancingCashFlow = Object.values(state.cashFlowStatement.financingActivities).reduce((a, b) => a + b, 0);
    
    const netCashFlow = totalOperatingCashFlow + totalInvestingCashFlow + totalFinancingCashFlow;
    
    // Return the state with derived calculations
    return {
      ...state,
      balanceSheet: {
        ...state.balanceSheet,
        totalCurrentAssets,
        totalNonCurrentAssets,
        totalAssets,
        totalCurrentLiabilities,
        totalNonCurrentLiabilities,
        totalLiabilities,
        totalEquity
      },
      incomeStatement: {
        ...state.incomeStatement,
        grossProfit,
        totalOperatingExpenses,
        operatingIncome,
        incomeBeforeTax,
        netIncome
      },
      cashFlowStatement: {
        ...state.cashFlowStatement,
        operatingActivities: {
          ...state.cashFlowStatement.operatingActivities,
          netIncome
        },
        totalOperatingCashFlow,
        totalInvestingCashFlow,
        totalFinancingCashFlow,
        netCashFlow
      }
    };
  };

  // Custom methods
  return {
    subscribe,
    
    // Initialize the store with default data
    initialize: () => {
      set(calculateDerivedValues(initialState));
    },
    
    // Record a new transaction
    recordTransaction: (transaction) => {
      update(state => {
        const newState = processTransaction(state, transaction);
        
        // Add the transaction to the list
        newState.transactions = [...state.transactions, {
          ...transaction,
          id: state.transactions.length + 1,
          date: new Date()
        }];
        
        // Add a snapshot to history
        newState.history = [...state.history, {
          timestamp: new Date(),
          balanceSheet: {...newState.balanceSheet},
          incomeStatement: {...newState.incomeStatement},
          cashFlowStatement: {...newState.cashFlowStatement},
          transaction: {
            ...transaction,
            id: state.transactions.length + 1
          }
        }];
        
        return calculateDerivedValues(newState);
      });
    },
    
    // Reset to starting data
    reset: () => {
      set(calculateDerivedValues(initialState));
    },
    
    // Undo the last transaction
    undo: () => {
      update(state => {
        if (state.history.length === 0) return state;
        
        // Get previous state (before the last transaction)
        const newHistory = [...state.history];
        newHistory.pop(); // Remove the last history entry
        
        if (newHistory.length === 0) {
          // If no history left, reset to initial state
          return calculateDerivedValues(initialState);
        }
        
        // Get the last state from history
        const lastState = newHistory[newHistory.length - 1];
        
        return {
          balanceSheet: {...lastState.balanceSheet},
          incomeStatement: {...lastState.incomeStatement},
          cashFlowStatement: {...lastState.cashFlowStatement},
          transactions: state.transactions.slice(0, -1),
          history: newHistory
        };
      });
    }
  };
};

// Helper function to process a transaction and update the financial statements
function processTransaction(state, transaction) {
  const newState = {
    balanceSheet: {...state.balanceSheet},
    incomeStatement: {...state.incomeStatement},
    cashFlowStatement: {...state.cashFlowStatement}
  };
  
  // Process different transaction types
  switch (transaction.type) {
    case 'sale':
      // Update income statement
      newState.incomeStatement.revenue += transaction.amount;
      
      // Update balance sheet
      if (transaction.paymentMethod === 'cash') {
        newState.balanceSheet.assets.currentAssets.cash += transaction.amount;
      } else {
        newState.balanceSheet.assets.currentAssets.accountsReceivable += transaction.amount;
      }
      
      // If there's cost of goods sold
      if (transaction.cogs) {
        newState.incomeStatement.costOfGoodsSold += transaction.cogs;
        newState.balanceSheet.assets.currentAssets.inventory -= transaction.cogs;
      }
      
      // Update cash flow statement
      if (transaction.paymentMethod === 'cash') {
        newState.cashFlowStatement.operatingActivities.otherOperatingAdjustments += transaction.amount;
      } else {
        newState.cashFlowStatement.operatingActivities.changeInAccountsReceivable -= transaction.amount;
      }
      break;
      
    case 'purchase':
      // Update balance sheet - inventory increases, cash decreases
      newState.balanceSheet.assets.currentAssets.inventory += transaction.amount;
      
      if (transaction.paymentMethod === 'cash') {
        newState.balanceSheet.assets.currentAssets.cash -= transaction.amount;
        newState.cashFlowStatement.operatingActivities.otherOperatingAdjustments -= transaction.amount;
      } else {
        newState.balanceSheet.liabilities.currentLiabilities.accountsPayable += transaction.amount;
        newState.cashFlowStatement.operatingActivities.changeInAccountsPayable += transaction.amount;
      }
      break;
      
    case 'expense':
      // Update income statement
      if (transaction.expenseType in newState.incomeStatement.operatingExpenses) {
        newState.incomeStatement.operatingExpenses[transaction.expenseType] += transaction.amount;
      } else {
        newState.incomeStatement.operatingExpenses.other += transaction.amount;
      }
      
      // Update balance sheet
      if (transaction.paymentMethod === 'cash') {
        newState.balanceSheet.assets.currentAssets.cash -= transaction.amount;
        newState.cashFlowStatement.operatingActivities.otherOperatingAdjustments -= transaction.amount;
      } else {
        newState.balanceSheet.liabilities.currentLiabilities.accountsPayable += transaction.amount;
        newState.cashFlowStatement.operatingActivities.changeInAccountsPayable += transaction.amount;
      }
      break;
      
    case 'asset-purchase':
      // Update balance sheet
      if (transaction.assetType === 'equipment') {
        newState.balanceSheet.assets.nonCurrentAssets.equipment += transaction.amount;
        newState.cashFlowStatement.investingActivities.purchaseOfEquipment -= transaction.amount;
      } else if (transaction.assetType === 'property') {
        newState.balanceSheet.assets.nonCurrentAssets.property += transaction.amount;
        newState.cashFlowStatement.investingActivities.purchaseOfEquipment -= transaction.amount;
      } else if (transaction.assetType === 'investment') {
        newState.balanceSheet.assets.nonCurrentAssets.longTermInvestments += transaction.amount;
        newState.cashFlowStatement.investingActivities.purchaseOfInvestments -= transaction.amount;
      }
      
      // Update cash flow
      newState.balanceSheet.assets.currentAssets.cash -= transaction.amount;
      break;
      
    case 'loan':
      // Update balance sheet - cash increases, debt increases
      newState.balanceSheet.assets.currentAssets.cash += transaction.amount;
      
      if (transaction.term === 'short-term') {
        newState.balanceSheet.liabilities.currentLiabilities.shortTermDebt += transaction.amount;
      } else {
        newState.balanceSheet.liabilities.nonCurrentLiabilities.longTermDebt += transaction.amount;
      }
      
      // Update cash flow statement
      newState.cashFlowStatement.financingActivities.debtRepayment += transaction.amount;
      break;
      
    case 'loan-payment':
      // Update balance sheet - cash decreases, debt decreases
      newState.balanceSheet.assets.currentAssets.cash -= transaction.amount;
      
      // Split between principal and interest
      const principal = transaction.principal || transaction.amount * 0.8; // Estimate if not provided
      const interest = transaction.interest || transaction.amount * 0.2;
      
      if (transaction.term === 'short-term') {
        newState.balanceSheet.liabilities.currentLiabilities.shortTermDebt -= principal;
      } else {
        newState.balanceSheet.liabilities.nonCurrentLiabilities.longTermDebt -= principal;
      }
      
      // Update income statement for interest
      newState.incomeStatement.interestExpense += interest;
      
      // Update cash flow statement
      newState.cashFlowStatement.financingActivities.debtRepayment -= principal;
      break;
      
    case 'equity-investment':
      // Update balance sheet - cash and equity increase
      newState.balanceSheet.assets.currentAssets.cash += transaction.amount;
      newState.balanceSheet.equity.commonStock += transaction.amount;
      
      // Update cash flow statement
      newState.cashFlowStatement.financingActivities.issuanceOfStock += transaction.amount;
      break;
      
    case 'dividend':
      // Update balance sheet - cash and retained earnings decrease
      newState.balanceSheet.assets.currentAssets.cash -= transaction.amount;
      newState.balanceSheet.equity.retainedEarnings -= transaction.amount;
      
      // Update cash flow statement
      newState.cashFlowStatement.financingActivities.dividendsPaid -= transaction.amount;
      break;
      
    case 'depreciation':
      // Update income statement
      newState.incomeStatement.operatingExpenses.depreciation += transaction.amount;
      
      // Update balance sheet
      newState.balanceSheet.assets.nonCurrentAssets.accumulatedDepreciation -= transaction.amount;
      
      // Update cash flow statement (non-cash expense)
      newState.cashFlowStatement.operatingActivities.depreciation += transaction.amount;
      break;
      
    case 'custom':
      // Apply custom transaction changes
      transaction.affects.forEach(effect => {
        const { statement, account, subAccount, change } = effect;
        
        // Handle changes to balance sheet
        if (statement === 'balanceSheet') {
          if (account === 'assets') {
            if (subAccount in newState.balanceSheet.assets.currentAssets) {
              newState.balanceSheet.assets.currentAssets[subAccount] += change;
            } else if (subAccount in newState.balanceSheet.assets.nonCurrentAssets) {
              newState.balanceSheet.assets.nonCurrentAssets[subAccount] += change;
            }
          } else if (account === 'liabilities') {
            if (subAccount in newState.balanceSheet.liabilities.currentLiabilities) {
              newState.balanceSheet.liabilities.currentLiabilities[subAccount] += change;
            } else if (subAccount in newState.balanceSheet.liabilities.nonCurrentLiabilities) {
              newState.balanceSheet.liabilities.nonCurrentLiabilities[subAccount] += change;
            }
          } else if (account === 'equity') {
            if (subAccount in newState.balanceSheet.equity) {
              newState.balanceSheet.equity[subAccount] += change;
            }
          }
        }
        
        // Handle changes to income statement
        else if (statement === 'incomeStatement') {
          if (account === 'revenue') {
            newState.incomeStatement.revenue += change;
          } else if (account === 'costOfGoodsSold') {
            newState.incomeStatement.costOfGoodsSold += change;
          } else if (account === 'operatingExpenses') {
            if (subAccount in newState.incomeStatement.operatingExpenses) {
              newState.incomeStatement.operatingExpenses[subAccount] += change;
            } else {
              newState.incomeStatement.operatingExpenses.other += change;
            }
          } else if (account === 'otherIncome') {
            newState.incomeStatement.otherIncome += change;
          } else if (account === 'interestExpense') {
            newState.incomeStatement.interestExpense += change;
          } else if (account === 'taxExpense') {
            newState.incomeStatement.taxExpense += change;
          }
        }
        
        // Handle changes to cash flow statement
        else if (statement === 'cashFlowStatement') {
          if (account === 'operatingActivities') {
            if (subAccount in newState.cashFlowStatement.operatingActivities) {
              newState.cashFlowStatement.operatingActivities[subAccount] += change;
            }
          } else if (account === 'investingActivities') {
            if (subAccount in newState.cashFlowStatement.investingActivities) {
              newState.cashFlowStatement.investingActivities[subAccount] += change;
            }
          } else if (account === 'financingActivities') {
            if (subAccount in newState.cashFlowStatement.financingActivities) {
              newState.cashFlowStatement.financingActivities[subAccount] += change;
            }
          }
        }
      });
      break;
  }
  
  return newState;
}

// Create and export the store
export const financialData = createFinancialDataStore();

// Create derived stores for financial ratios
export const financialRatios = derived(financialData, ($financialData) => {
  // Liquidity Ratios
  const currentRatio = $financialData.balanceSheet.totalCurrentAssets / $financialData.balanceSheet.totalCurrentLiabilities;
  const quickRatio = ($financialData.balanceSheet.assets.currentAssets.cash + 
                     $financialData.balanceSheet.assets.currentAssets.accountsReceivable + 
                     $financialData.balanceSheet.assets.currentAssets.shortTermInvestments) / 
                     $financialData.balanceSheet.totalCurrentLiabilities;
  
  // Profitability Ratios
  const grossProfitMargin = $financialData.incomeStatement.grossProfit / $financialData.incomeStatement.revenue;
  const netProfitMargin = $financialData.incomeStatement.netIncome / $financialData.incomeStatement.revenue;
  const returnOnAssets = $financialData.incomeStatement.netIncome / $financialData.balanceSheet.totalAssets;
  const returnOnEquity = $financialData.incomeStatement.netIncome / $financialData.balanceSheet.totalEquity;
  
  // Solvency Ratios
  const debtToEquityRatio = $financialData.balanceSheet.totalLiabilities / $financialData.balanceSheet.totalEquity;
  const debtToAssetsRatio = $financialData.balanceSheet.totalLiabilities / $financialData.balanceSheet.totalAssets;
  const interestCoverageRatio = $financialData.incomeStatement.operatingIncome / $financialData.incomeStatement.interestExpense;
  
  // Efficiency Ratios
  const inventoryTurnover = $financialData.incomeStatement.costOfGoodsSold / $financialData.balanceSheet.assets.currentAssets.inventory;
  const assetTurnover = $financialData.incomeStatement.revenue / $financialData.balanceSheet.totalAssets;
  
  return {
    liquidity: {
      currentRatio,
      quickRatio
    },
    profitability: {
      grossProfitMargin,
      netProfitMargin,
      returnOnAssets,
      returnOnEquity
    },
    solvency: {
      debtToEquityRatio,
      debtToAssetsRatio,
      interestCoverageRatio
    },
    efficiency: {
      inventoryTurnover,
      assetTurnover
    }
  };
});