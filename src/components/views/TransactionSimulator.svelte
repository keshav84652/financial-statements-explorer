<script>
  import { financialData } from '../../stores/financialStore';
  import { simulatorState } from '../../stores/uiStore';
  import StatementTable from '../ui/StatementTable.svelte';
  import { PlusCircle, Play, RotateCcw, ChevronDown, Save, AlertTriangle } from 'lucide-svelte';
  import { fly, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import StatementFlowDiagram from '../charts/StatementFlowDiagram.svelte';
  
  // Predefined transaction types
  const transactionTypes = [
    { 
      id: 'sale-cash', 
      name: 'Cash Sale', 
      description: 'Record revenue from a cash sale',
      type: 'sale',
      defaults: {
        amount: 10000,
        paymentMethod: 'cash',
        cogs: 6000
      },
      fields: [
        { name: 'amount', label: 'Sale Amount', type: 'number', min: 0 },
        { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', min: 0 }
      ],
      impacts: [
        { statement: 'incomeStatement', account: 'Revenue', change: '+amount' },
        { statement: 'incomeStatement', account: 'Cost of Goods Sold', change: '+cogs' },
        { statement: 'balanceSheet', account: 'Cash', change: '+amount' },
        { statement: 'balanceSheet', account: 'Inventory', change: '-cogs' },
        { statement: 'cashFlowStatement', account: 'Operating Activities', change: '+amount' }
      ]
    },
    { 
      id: 'sale-credit', 
      name: 'Credit Sale', 
      description: 'Record revenue from a credit sale',
      type: 'sale',
      defaults: {
        amount: 10000,
        paymentMethod: 'credit',
        cogs: 6000
      },
      fields: [
        { name: 'amount', label: 'Sale Amount', type: 'number', min: 0 },
        { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', min: 0 }
      ],
      impacts: [
        { statement: 'incomeStatement', account: 'Revenue', change: '+amount' },
        { statement: 'incomeStatement', account: 'Cost of Goods Sold', change: '+cogs' },
        { statement: 'balanceSheet', account: 'Accounts Receivable', change: '+amount' },
        { statement: 'balanceSheet', account: 'Inventory', change: '-cogs' },
        { statement: 'cashFlowStatement', account: 'Operating Activities', change: '0' }
      ]
    },
    { 
      id: 'inventory-purchase', 
      name: 'Inventory Purchase', 
      description: 'Purchase inventory using cash or on credit',
      type: 'purchase',
      defaults: {
        amount: 15000,
        paymentMethod: 'cash'
      },
      fields: [
        { name: 'amount', label: 'Purchase Amount', type: 'number', min: 0 },
        { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['cash', 'credit'] }
      ],
      impacts: [
        { statement: 'balanceSheet', account: 'Inventory', change: '+amount' },
        { statement: 'balanceSheet', account: 'Cash/Accounts Payable', change: '-amount' },
        { statement: 'cashFlowStatement', account: 'Operating Activities', change: '-amount if cash' }
      ]
    },
    { 
      id: 'operating-expense', 
      name: 'Operating Expense', 
      description: 'Record an operating expense',
      type: 'expense',
      defaults: {
        amount: 5000,
        expenseType: 'salaries',
        paymentMethod: 'cash'
      },
      fields: [
        { name: 'amount', label: 'Expense Amount', type: 'number', min: 0 },
        { name: 'expenseType', label: 'Expense Type', type: 'select', options: ['salaries', 'rent', 'utilities', 'marketing', 'other'] },
        { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['cash', 'credit'] }
      ],
      impacts: [
        { statement: 'incomeStatement', account: 'Operating Expenses', change: '+amount' },
        { statement: 'balanceSheet', account: 'Cash/Accounts Payable', change: '-amount' },
        { statement: 'cashFlowStatement', account: 'Operating Activities', change: '-amount if cash' }
      ]
    },
    { 
      id: 'asset-purchase', 
      name: 'Asset Purchase', 
      description: 'Purchase property, equipment, or other long-term assets',
      type: 'asset-purchase',
      defaults: {
        amount: 50000,
        assetType: 'equipment'
      },
      fields: [
        { name: 'amount', label: 'Purchase Amount', type: 'number', min: 0 },
        { name: 'assetType', label: 'Asset Type', type: 'select', options: ['equipment', 'property', 'investment'] }
      ],
      impacts: [
        { statement: 'balanceSheet', account: 'Property/Equipment/Investments', change: '+amount' },
        { statement: 'balanceSheet', account: 'Cash', change: '-amount' },
        { statement: 'cashFlowStatement', account: 'Investing Activities', change: '-amount' }
      ]
    },
    { 
      id: 'loan', 
      name: 'Loan Received', 
      description: 'Record a new loan or debt',
      type: 'loan',
      defaults: {
        amount: 100000,
        term: 'long-term'
      },
      fields: [
        { name: 'amount', label: 'Loan Amount', type: 'number', min: 0 },
        { name: 'term', label: 'Loan Term', type: 'select', options: ['short-term', 'long-term'] }
      ],
      impacts: [
        { statement: 'balanceSheet', account: 'Cash', change: '+amount' },
        { statement: 'balanceSheet', account: 'Short/Long-Term Debt', change: '+amount' },
        { statement: 'cashFlowStatement', account: 'Financing Activities', change: '+amount' }
      ]
    },
    { 
      id: 'loan-payment', 
      name: 'Loan Payment', 
      description: 'Make a payment on existing debt',
      type: 'loan-payment',
      defaults: {
        amount: 10000,
        principal: 8000,
        interest: 2000,
        term: 'long-term'
      },
      fields: [
        { name: 'amount', label: 'Total Payment', type: 'number', min: 0 },
        { name: 'principal', label: 'Principal Portion', type: 'number', min: 0 },
        { name: 'interest', label: 'Interest Portion', type: 'number', min: 0 },
        { name: 'term', label: 'Loan Term', type: 'select', options: ['short-term', 'long-term'] }
      ],
      impacts: [
        { statement: 'incomeStatement', account: 'Interest Expense', change: '+interest' },
        { statement: 'balanceSheet', account: 'Cash', change: '-amount' },
        { statement: 'balanceSheet', account: 'Short/Long-Term Debt', change: '-principal' },
        { statement: 'cashFlowStatement', account: 'Financing Activities', change: '-principal' },
        { statement: 'cashFlowStatement', account: 'Operating Activities', change: '-interest' }
      ]
    },
    { 
      id: 'equity-investment', 
      name: 'Equity Investment', 
      description: 'Record new equity investment',
      type: 'equity-investment',
      defaults: {
        amount: 50000
      },
      fields: [
        { name: 'amount', label: 'Investment Amount', type: 'number', min: 0 }
      ],
      impacts: [
        { statement: 'balanceSheet', account: 'Cash', change: '+amount' },
        { statement: 'balanceSheet', account: 'Common Stock', change: '+amount' },
        { statement: 'cashFlowStatement', account: 'Financing Activities', change: '+amount' }
      ]
    },
    { 
      id: 'dividend', 
      name: 'Dividend Payment', 
      description: 'Pay dividends to shareholders',
      type: 'dividend',
      defaults: {
        amount: 15000
      },
      fields: [
        { name: 'amount', label: 'Dividend Amount', type: 'number', min: 0 }
      ],
      impacts: [
        { statement: 'balanceSheet', account: 'Cash', change: '-amount' },
        { statement: 'balanceSheet', account: 'Retained Earnings', change: '-amount' },
        { statement: 'cashFlowStatement', account: 'Financing Activities', change: '-amount' }
      ]
    },
    { 
      id: 'depreciation', 
      name: 'Depreciation Expense', 
      description: 'Record depreciation expense (non-cash)',
      type: 'depreciation',
      defaults: {
        amount: 5000
      },
      fields: [
        { name: 'amount', label: 'Depreciation Amount', type: 'number', min: 0 }
      ],
      impacts: [
        { statement: 'incomeStatement', account: 'Depreciation Expense', change: '+amount' },
        { statement: 'balanceSheet', account: 'Accumulated Depreciation', change: '-amount' },
        { statement: 'cashFlowStatement', account: 'Operating Activities (non-cash adjustment)', change: '+amount' }
      ]
    },
    { 
      id: 'custom', 
      name: 'Custom Transaction', 
      description: 'Create a custom transaction with specific impacts',
      type: 'custom',
      defaults: {
        name: 'Custom Transaction',
        affects: []
      },
      fields: [
        { name: 'name', label: 'Transaction Name', type: 'text' }
      ],
      customizable: true
    }
  ];
  
  // Current transaction data
  let currentTransaction = {
    type: '',
    name: '',
    amount: 0,
    data: {}
  };
  
  // Transaction panel state
  let isPanelOpen = false;
  let formError = '';
  let showImpact = true;
  let customEffects = [];
  
  // History of recorded transactions
  let transactionHistory = [];
  
  // Helper to get a transaction type by ID
  const getTransactionTypeById = (id) => {
    return transactionTypes.find(type => type.id === id);
  };
  
  // Select a transaction type
  const selectTransactionType = (typeId) => {
    const selectedType = getTransactionTypeById(typeId);
    if (selectedType) {
      currentTransaction = {
        type: selectedType.id,
        name: selectedType.name,
        data: { ...selectedType.defaults }
      };
      
      // Reset custom effects if switching to a custom transaction
      if (selectedType.id === 'custom') {
        customEffects = [createEmptyEffect()];
      }
      
      formError = '';
      isPanelOpen = true;
    }
  };
  
  // Create an empty effect for custom transactions
  const createEmptyEffect = () => {
    return {
      statement: 'balanceSheet',
      account: 'assets',
      subAccount: 'currentAssets.cash',
      change: 0
    };
  };
  
  // Add a new custom effect
  const addCustomEffect = () => {
    customEffects = [...customEffects, createEmptyEffect()];
  };
  
  // Remove a custom effect
  const removeCustomEffect = (index) => {
    customEffects = customEffects.filter((_, i) => i !== index);
  };
  
  // Execute the transaction
  const executeTransaction = () => {
    // Validate transaction
    if (!validateTransaction()) {
      return;
    }
    
    // Create the final transaction object based on type
    const selectedType = getTransactionTypeById(currentTransaction.type);
    let transaction = {
      type: selectedType.type,
      name: currentTransaction.name || selectedType.name,
      ...currentTransaction.data
    };
    
    // For custom transactions, add the custom effects
    if (currentTransaction.type === 'custom') {
      transaction.affects = customEffects.map(effect => ({
        statement: effect.statement,
        account: effect.account,
        subAccount: effect.subAccount,
        change: parseFloat(effect.change)
      }));
    }
    
    // Record the transaction
    financialData.recordTransaction(transaction);
    
    // Update history
    transactionHistory = [
      {
        ...transaction,
        date: new Date(),
        id: transactionHistory.length + 1
      },
      ...transactionHistory
    ];
    
    // Reset form
    isPanelOpen = false;
    currentTransaction = {
      type: '',
      name: '',
      data: {}
    };
  };
  
  // Reset the financial data
  const resetFinancialData = () => {
    financialData.reset();
    transactionHistory = [];
  };
  
  // Validate the transaction before execution
  const validateTransaction = () => {
    formError = '';
    
    // Check if required fields are filled
    const selectedType = getTransactionTypeById(currentTransaction.type);
    if (!selectedType) {
      formError = 'Please select a transaction type.';
      return false;
    }
    
    // For custom transactions, validate effects
    if (currentTransaction.type === 'custom') {
      if (customEffects.length === 0) {
        formError = 'Please add at least one effect for the custom transaction.';
        return false;
      }
      
      for (const effect of customEffects) {
        if (!effect.statement || !effect.account || !effect.subAccount || effect.change === '') {
          formError = 'Please fill in all fields for each effect.';
          return false;
        }
      }
    } 
    // For predefined transactions, validate required fields
    else if (selectedType.fields) {
      for (const field of selectedType.fields) {
        if (field.type === 'number' && (currentTransaction.data[field.name] === undefined || isNaN(currentTransaction.data[field.name]))) {
          formError = `Please enter a valid number for ${field.label}.`;
          return false;
        }
        else if (field.type !== 'number' && !currentTransaction.data[field.name]) {
          formError = `Please fill in the ${field.label} field.`;
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Determine which statements are affected
  const getAffectedStatements = () => {
    const selectedType = getTransactionTypeById(currentTransaction.type);
    if (!selectedType) return [];
    
    // For custom transactions, check customEffects
    if (currentTransaction.type === 'custom') {
      const affected = new Set();
      customEffects.forEach(effect => {
        affected.add(effect.statement);
      });
      return Array.from(affected);
    }
    
    // For predefined transactions, check impacts
    const affected = new Set();
    if (selectedType.impacts) {
      selectedType.impacts.forEach(impact => {
        affected.add(impact.statement);
      });
    }
    return Array.from(affected);
  };
  
  // Get a preview of how the transaction impacts the statements
  const getImpactPreview = () => {
    const selectedType = getTransactionTypeById(currentTransaction.type);
    if (!selectedType) return [];
    
    const impacts = [];
    
    // For custom transactions, use customEffects
    if (currentTransaction.type === 'custom') {
      customEffects.forEach(effect => {
        impacts.push({
          statement: effect.statement,
          account: `${effect.account}.${effect.subAccount}`,
          change: parseFloat(effect.change) > 0 ? `+$${parseFloat(effect.change).toLocaleString()}` : `-$${Math.abs(parseFloat(effect.change)).toLocaleString()}`,
          isPositive: parseFloat(effect.change) > 0
        });
      });
    }
    // For predefined transactions, interpret the impacts
    else if (selectedType.impacts) {
      selectedType.impacts.forEach(impact => {
        let changeValue = impact.change;
        
        // Interpret the change expression
        if (typeof changeValue === 'string') {
          // Handle expressions like '+amount'
          if (changeValue.includes('amount')) {
            const amount = currentTransaction.data.amount || 0;
            if (changeValue.startsWith('+')) {
              changeValue = amount;
            } else if (changeValue.startsWith('-')) {
              changeValue = -amount;
            } else {
              changeValue = 0;
            }
          }
          // Handle expressions like '+interest'
          else if (changeValue.includes('interest')) {
            const interest = currentTransaction.data.interest || 0;
            if (changeValue.startsWith('+')) {
              changeValue = interest;
            } else if (changeValue.startsWith('-')) {
              changeValue = -interest;
            } else {
              changeValue = 0;
            }
          }
          // Handle expressions like '+principal'
          else if (changeValue.includes('principal')) {
            const principal = currentTransaction.data.principal || 0;
            if (changeValue.startsWith('+')) {
              changeValue = principal;
            } else if (changeValue.startsWith('-')) {
              changeValue = -principal;
            } else {
              changeValue = 0;
            }
          }
          // Handle expressions like '+cogs'
          else if (changeValue.includes('cogs')) {
            const cogs = currentTransaction.data.cogs || 0;
            if (changeValue.startsWith('+')) {
              changeValue = cogs;
            } else if (changeValue.startsWith('-')) {
              changeValue = -cogs;
            } else {
              changeValue = 0;
            }
          }
          // Handle conditional expressions like '-amount if cash'
          else if (changeValue.includes('if')) {
            const [expression, condition] = changeValue.split(' if ');
            const amount = currentTransaction.data.amount || 0;
            const conditionMet = condition.trim() === currentTransaction.data.paymentMethod;
            
            if (conditionMet) {
              if (expression.startsWith('+')) {
                changeValue = amount;
              } else if (expression.startsWith('-')) {
                changeValue = -amount;
              }
            } else {
              changeValue = 0;
            }
          }
          // Handle fixed values
          else if (changeValue === '0') {
            changeValue = 0;
          }
        }
        
        // Add the impact to the list
        impacts.push({
          statement: impact.statement,
          account: impact.account,
          change: parseFloat(changeValue) > 0 ? `+$${parseFloat(changeValue).toLocaleString()}` : parseFloat(changeValue) < 0 ? `-$${Math.abs(parseFloat(changeValue)).toLocaleString()}` : '$0',
          isPositive: parseFloat(changeValue) > 0
        });
      });
    }
    
    return impacts;
  };
  
  // Get a list of statement accounts for custom transaction dropdown
  const getStatementAccounts = (statement) => {
    switch (statement) {
      case 'balanceSheet':
        return [
          { value: 'assets', label: 'Assets' },
          { value: 'liabilities', label: 'Liabilities' },
          { value: 'equity', label: 'Equity' }
        ];
      case 'incomeStatement':
        return [
          { value: 'revenue', label: 'Revenue' },
          { value: 'costOfGoodsSold', label: 'Cost of Goods Sold' },
          { value: 'operatingExpenses', label: 'Operating Expenses' },
          { value: 'otherIncome', label: 'Other Income' },
          { value: 'interestExpense', label: 'Interest Expense' },
          { value: 'taxExpense', label: 'Tax Expense' }
        ];
      case 'cashFlowStatement':
        return [
          { value: 'operatingActivities', label: 'Operating Activities' },
          { value: 'investingActivities', label: 'Investing Activities' },
          { value: 'financingActivities', label: 'Financing Activities' }
        ];
      default:
        return [];
    }
  };
  
  // Get a list of subaccounts based on the selected statement and account
  const getSubAccounts = (statement, account) => {
    // For balanceSheet
    if (statement === 'balanceSheet') {
      if (account === 'assets') {
        return [
          { value: 'currentAssets.cash', label: 'Cash' },
          { value: 'currentAssets.accountsReceivable', label: 'Accounts Receivable' },
          { value: 'currentAssets.inventory', label: 'Inventory' },
          { value: 'currentAssets.prepaidExpenses', label: 'Prepaid Expenses' },
          { value: 'currentAssets.shortTermInvestments', label: 'Short-Term Investments' },
          { value: 'nonCurrentAssets.property', label: 'Property' },
          { value: 'nonCurrentAssets.equipment', label: 'Equipment' },
          { value: 'nonCurrentAssets.accumulatedDepreciation', label: 'Accumulated Depreciation' },
          { value: 'nonCurrentAssets.longTermInvestments', label: 'Long-Term Investments' },
          { value: 'nonCurrentAssets.intangibleAssets', label: 'Intangible Assets' }
        ];
      } else if (account === 'liabilities') {
        return [
          { value: 'currentLiabilities.accountsPayable', label: 'Accounts Payable' },
          { value: 'currentLiabilities.shortTermDebt', label: 'Short-Term Debt' },
          { value: 'currentLiabilities.accruedExpenses', label: 'Accrued Expenses' },
          { value: 'currentLiabilities.deferredRevenue', label: 'Deferred Revenue' },
          { value: 'currentLiabilities.taxesPayable', label: 'Taxes Payable' },
          { value: 'nonCurrentLiabilities.longTermDebt', label: 'Long-Term Debt' },
          { value: 'nonCurrentLiabilities.deferredTaxLiabilities', label: 'Deferred Tax Liabilities' },
          { value: 'nonCurrentLiabilities.pensionLiabilities', label: 'Pension Liabilities' }
        ];
      } else if (account === 'equity') {
        return [
          { value: 'commonStock', label: 'Common Stock' },
          { value: 'retainedEarnings', label: 'Retained Earnings' },
          { value: 'additionalPaidInCapital', label: 'Additional Paid-In Capital' },
          { value: 'treasuryStock', label: 'Treasury Stock' }
        ];
      }
    }
    
    // For incomeStatement
    else if (statement === 'incomeStatement') {
      if (account === 'operatingExpenses') {
        return [
          { value: 'salaries', label: 'Salaries' },
          { value: 'rent', label: 'Rent' },
          { value: 'utilities', label: 'Utilities' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'depreciation', label: 'Depreciation' },
          { value: 'other', label: 'Other' }
        ];
      } else {
        return [{ value: account, label: account }];
      }
    }
    
    // For cashFlowStatement
    else if (statement === 'cashFlowStatement') {
      if (account === 'operatingActivities') {
        return [
          { value: 'netIncome', label: 'Net Income' },
          { value: 'depreciation', label: 'Depreciation' },
          { value: 'changeInInventory', label: 'Change in Inventory' },
          { value: 'changeInAccountsReceivable', label: 'Change in Accounts Receivable' },
          { value: 'changeInAccountsPayable', label: 'Change in Accounts Payable' },
          { value: 'changeInAccruedExpenses', label: 'Change in Accrued Expenses' },
          { value: 'otherOperatingAdjustments', label: 'Other Operating Adjustments' }
        ];
      } else if (account === 'investingActivities') {
        return [
          { value: 'purchaseOfEquipment', label: 'Purchase of Equipment' },
          { value: 'purchaseOfInvestments', label: 'Purchase of Investments' },
          { value: 'saleOfInvestments', label: 'Sale of Investments' }
        ];
      } else if (account === 'financingActivities') {
        return [
          { value: 'debtRepayment', label: 'Debt Repayment' },
          { value: 'dividendsPaid', label: 'Dividends Paid' },
          { value: 'issuanceOfStock', label: 'Issuance of Stock' }
        ];
      }
    }
    
    return [];
  };
  
  // Filter transaction types by search term
  let searchTerm = '';
  $: filteredTransactionTypes = searchTerm
    ? transactionTypes.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    : transactionTypes;
    
  // Get highlight flow based on transaction
  let highlightedFlow = null;
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Transaction Simulator</h1>
    
    <div class="flex gap-2">
      <button 
        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
        on:click={resetFinancialData}
      >
        <RotateCcw size={18} class="mr-2" />
        Reset
      </button>
    </div>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Transaction column -->
    <div class="lg:col-span-1">
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Create Transaction</h2>
        
        <!-- Transaction search -->
        <div class="mb-4">
          <input 
            type="text" 
            placeholder="Search transactions..." 
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary" 
            bind:value={searchTerm}
          />
        </div>
        
        <!-- Transaction types list -->
        <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
          {#each filteredTransactionTypes as transactionType}
            <button 
              class="w-full p-3 text-left rounded-md transition border border-slate-200 hover:bg-slate-50"
              on:click={() => selectTransactionType(transactionType.id)}
            >
              <div class="font-medium">{transactionType.name}</div>
              <div class="text-sm text-slate-500 mt-1">{transactionType.description}</div>
            </button>
          {/each}
        </div>
        
        <!-- Transaction history -->
        <div class="mt-6">
          <h3 class="font-medium text-lg mb-3">Transaction History</h3>
          
          {#if transactionHistory.length === 0}
            <div class="p-4 bg-slate-50 rounded-md text-slate-500 text-center">
              No transactions yet. Create a transaction to see it here.
            </div>
          {:else}
            <div class="space-y-2 max-h-80 overflow-y-auto">
              {#each transactionHistory as transaction (transaction.id)}
                <div 
                  class="p-3 border border-slate-200 rounded-md"
                  animate:flip={{ duration: 300 }}
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium">{transaction.name}</div>
                      <div class="text-sm text-slate-500">
                        {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div class="text-right font-medium">
                      {#if transaction.amount}
                        ${transaction.amount.toLocaleString()}
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Transaction effects column -->
    <div class="lg:col-span-2">
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Financial Impact Visualization</h2>
        
        <!-- Financial flow diagram -->
        <div class="mb-6">
          <StatementFlowDiagram height={400} {highlightedFlow} />
        </div>
        
        <!-- Impact preview cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            class="p-4 border border-slate-200 rounded-md"
            on:click={() => highlightedFlow = 'netIncome'}
            on:keydown={(e) => e.key === 'Enter' && (highlightedFlow = 'netIncome')}
            tabindex="0"
            role="button"
            class:border-primary={highlightedFlow === 'netIncome'}
            class:bg-blue-50={highlightedFlow === 'netIncome'}
          >
            <h3 class="font-medium text-lg">Income Statement</h3>
            <div class="mt-2 flex items-baseline">
              <div class="text-2xl font-semibold">${$financialData.incomeStatement.netIncome.toLocaleString()}</div>
              <div class="ml-2 text-sm text-slate-500">Net Income</div>
            </div>
          </div>
          
          <div 
            class="p-4 border border-slate-200 rounded-md"
            on:click={() => highlightedFlow = 'cashFlowToCash'}
            on:keydown={(e) => e.key === 'Enter' && (highlightedFlow = 'cashFlowToCash')}
            tabindex="0"
            role="button"
            class:border-primary={highlightedFlow === 'cashFlowToCash'}
            class:bg-blue-50={highlightedFlow === 'cashFlowToCash'}
          >
            <h3 class="font-medium text-lg">Cash Position</h3>
            <div class="mt-2 flex items-baseline">
              <div class="text-2xl font-semibold">${$financialData.balanceSheet.assets.currentAssets.cash.toLocaleString()}</div>
              <div class="ml-2 text-sm text-slate-500">Cash Balance</div>
            </div>
          </div>
          
          <div 
            class="p-4 border border-slate-200 rounded-md"
            on:click={() => highlightedFlow = 'assetChangesToCashFlow'}
            on:keydown={(e) => e.key === 'Enter' && (highlightedFlow = 'assetChangesToCashFlow')}
            tabindex="0"
            role="button"
            class:border-primary={highlightedFlow === 'assetChangesToCashFlow'}
            class:bg-blue-50={highlightedFlow === 'assetChangesToCashFlow'}
          >
            <h3 class="font-medium text-lg">Operational Cash</h3>
            <div class="mt-2 flex items-baseline">
              <div class="text-2xl font-semibold">${$financialData.cashFlowStatement.totalOperatingCashFlow.toLocaleString()}</div>
              <div class="ml-2 text-sm text-slate-500">Operating CF</div>
            </div>
          </div>
        </div>
        
        <!-- Summary metrics cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <div class="text-sm text-slate-500">Total Assets</div>
            <div class="text-lg font-medium">${$financialData.balanceSheet.totalAssets.toLocaleString()}</div>
          </div>
          
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <div class="text-sm text-slate-500">Total Liabilities</div>
            <div class="text-lg font-medium">${$financialData.balanceSheet.totalLiabilities.toLocaleString()}</div>
          </div>
          
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <div class="text-sm text-slate-500">Revenue</div>
            <div class="text-lg font-medium">${$financialData.incomeStatement.revenue.toLocaleString()}</div>
          </div>
          
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <div class="text-sm text-slate-500">Net Cash Flow</div>
            <div class="text-lg font-medium">${$financialData.cashFlowStatement.netCashFlow.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Transaction form panel -->
  {#if isPanelOpen}
    <div 
      class="fixed inset-0 bg-black bg-opacity-25 z-40 flex items-center justify-center p-4"
      transition:fly={{ y: 20, duration: 200 }}
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        on:click|stopPropagation
        transition:fly={{ y: 20, duration: 300 }}
      >
        <!-- Panel header -->
        <div class="p-6 border-b border-slate-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">
              {getTransactionTypeById(currentTransaction.type)?.name || 'New Transaction'}
            </h2>
            <button 
              class="text-slate-400 hover:text-slate-600"
              on:click={() => isPanelOpen = false}
            >
              &times;
            </button>
          </div>
          <p class="text-slate-500 mt-1">
            {getTransactionTypeById(currentTransaction.type)?.description || ''}
          </p>
        </div>
        
        <!-- Panel content -->
        <div class="p-6">
          {#if formError}
            <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertTriangle size={20} class="mr-2 mt-0.5 flex-shrink-0" />
              <div>{formError}</div>
            </div>
          {/if}
          
          <!-- Form fields based on transaction type -->
          {#if currentTransaction.type}
            <div class="space-y-4">
              {#each getTransactionTypeById(currentTransaction.type)?.fields || [] as field}
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                  
                  {#if field.type === 'number'}
                    <input 
                      type="number" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                      bind:value={currentTransaction.data[field.name]}
                      min={field.min || 0}
                      step={field.step || 1}
                    />
                  {:else if field.type === 'text'}
                    <input 
                      type="text" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                      bind:value={currentTransaction.data[field.name]}
                    />
                  {:else if field.type === 'select' && field.options}
                    <select 
                      class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                      bind:value={currentTransaction.data[field.name]}
                    >
                      {#each field.options as option}
                        <option value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
                        </option>
                      {/each}
                    </select>
                  {/if}
                </div>
              {/each}
              
              <!-- Custom transaction fields -->
              {#if currentTransaction.type === 'custom'}
                <div class="mt-6">
                  <h3 class="font-medium text-lg mb-3">Transaction Effects</h3>
                  
                  {#each customEffects as effect, index (index)}
                    <div class="mb-4 p-4 bg-slate-50 rounded-md border border-slate-200">
                      <div class="flex justify-between mb-2">
                        <h4 class="font-medium">Effect #{index + 1}</h4>
                        {#if customEffects.length > 1}
                          <button 
                            class="text-red-500 hover:text-red-700"
                            on:click={() => removeCustomEffect(index)}
                          >
                            Remove
                          </button>
                        {/if}
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Statement</label>
                          <select 
                            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                            bind:value={effect.statement}
                          >
                            <option value="balanceSheet">Balance Sheet</option>
                            <option value="incomeStatement">Income Statement</option>
                            <option value="cashFlowStatement">Cash Flow Statement</option>
                          </select>
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Account</label>
                          <select 
                            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                            bind:value={effect.account}
                          >
                            {#each getStatementAccounts(effect.statement) as account}
                              <option value={account.value}>{account.label}</option>
                            {/each}
                          </select>
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Subaccount</label>
                          <select 
                            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                            bind:value={effect.subAccount}
                          >
                            {#each getSubAccounts(effect.statement, effect.account) as subAccount}
                              <option value={subAccount.value}>{subAccount.label}</option>
                            {/each}
                          </select>
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Change Amount</label>
                          <input 
                            type="number" 
                            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-primary"
                            bind:value={effect.change}
                            placeholder="Enter positive or negative amount"
                          />
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  <button 
                    class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors w-full flex items-center justify-center"
                    on:click={addCustomEffect}
                  >
                    <PlusCircle size={18} class="mr-2" />
                    Add Another Effect
                  </button>
                </div>
              {/if}
            </div>
          {/if}
          
          <!-- Impact preview -->
          <div class="mt-6">
            <button 
              class="flex items-center text-primary font-medium mb-2"
              on:click={() => showImpact = !showImpact}
            >
              {showImpact ? 'Hide' : 'Show'} Transaction Impact
              <ChevronDown 
                size={18} 
                class="ml-1 transition-transform" 
                style={showImpact ? 'transform: rotate(180deg)' : ''} 
              />
            </button>
            
            {#if showImpact}
              <div class="p-4 bg-slate-50 rounded-md border border-slate-200">
                <h3 class="font-medium mb-3">Affected Statements</h3>
                
                <div class="space-y-3">
                  {#each getAffectedStatements() as statement}
                    <div class="flex items-center text-slate-700">
                      <div class="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      {statement === 'balanceSheet' ? 'Balance Sheet' : 
                       statement === 'incomeStatement' ? 'Income Statement' : 
                       'Cash Flow Statement'}
                    </div>
                  {/each}
                </div>
                
                <h3 class="font-medium mt-4 mb-3">Impact Preview</h3>
                
                <div class="space-y-2">
                  {#each getImpactPreview() as impact}
                    <div class="flex justify-between items-center p-2 border-b border-slate-200 last:border-b-0">
                      <span class="text-slate-700">{impact.account}</span>
                      <span class={impact.isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {impact.change}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Panel footer -->
        <div class="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button 
            class="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            on:click={() => isPanelOpen = false}
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
            on:click={executeTransaction}
          >
            <Play size={18} class="mr-2" />
            Execute Transaction
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>