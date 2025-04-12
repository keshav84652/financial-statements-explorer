<script>
  import { onMount } from 'svelte';
  import { learningState } from '../../stores/uiStore';
  import { BookOpen, Check, ChevronRight, HelpCircle, AlertCircle, ArrowRight } from 'lucide-svelte';
  import StatementFlowDiagram from '../charts/StatementFlowDiagram.svelte';
  
  // Define the learning topics
  const topics = [
    {
      id: 'intro',
      title: 'Introduction to Financial Statements',
      description: 'Learn about the three primary financial statements and their purposes.',
      icon: BookOpen,
      duration: '5 min',
      sections: [
        {
          title: 'Overview of Financial Statements',
          content: `
            <p>Financial statements are formal records of a business's financial activities. They provide a snapshot of a company's financial health and performance.</p>
            
            <p>The three primary financial statements are:</p>
            <ul>
              <li><strong>Balance Sheet</strong>: Shows what a company owns (assets), what it owes (liabilities), and what remains for the owners (equity) at a specific point in time.</li>
              <li><strong>Income Statement</strong>: Shows revenues, expenses, and profits over a period of time.</li>
              <li><strong>Cash Flow Statement</strong>: Shows how cash moves in and out of the business over a period of time.</li>
            </ul>
            
            <p>Together, these statements tell the complete financial story of a business. Understanding how they work together is crucial for making informed business and investment decisions.</p>
          `
        },
        {
          title: 'The Accounting Equation',
          content: `
            <p>The foundation of financial statements is the accounting equation:</p>
            
            <div class="text-center text-xl font-medium my-4">Assets = Liabilities + Equity</div>
            
            <p>This equation must always balance. Every transaction affects at least two accounts, keeping the equation in balance.</p>
            
            <p>For example:</p>
            <ul>
              <li>When a company purchases inventory with cash, assets (inventory) increase and assets (cash) decrease by the same amount.</li>
              <li>When a company borrows money, assets (cash) increase and liabilities (loans) increase by the same amount.</li>
              <li>When a company makes a profit, assets increase and equity increases by the same amount.</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'balance-sheet',
      title: 'The Balance Sheet',
      description: 'Understand the components and structure of a balance sheet.',
      icon: BookOpen,
      duration: '8 min',
      sections: [
        {
          title: 'Balance Sheet Overview',
          content: `
            <p>The balance sheet, also called the statement of financial position, provides a snapshot of a company's financial condition at a specific point in time. It follows the accounting equation: Assets = Liabilities + Equity.</p>
            
            <p>Unlike the income statement and cash flow statement which cover a period of time, the balance sheet is like a photograph of the company's financial position on a specific date.</p>
          `
        },
        {
          title: 'Assets',
          content: `
            <p>Assets are resources owned by a company that have economic value and can provide future benefits. They are typically categorized as:</p>
            
            <p><strong>Current Assets:</strong> Resources that are expected to be converted to cash or used up within one year.</p>
            <ul>
              <li><strong>Cash and Cash Equivalents</strong>: Money in the bank, short-term investments</li>
              <li><strong>Accounts Receivable</strong>: Money owed to the company by customers</li>
              <li><strong>Inventory</strong>: Products held for sale</li>
              <li><strong>Prepaid Expenses</strong>: Payments made for future services</li>
            </ul>
            
            <p><strong>Non-Current Assets:</strong> Resources that provide value over a longer period.</p>
            <ul>
              <li><strong>Property, Plant, and Equipment</strong>: Land, buildings, machinery</li>
              <li><strong>Intangible Assets</strong>: Patents, copyrights, goodwill</li>
              <li><strong>Long-term Investments</strong>: Investments held for more than a year</li>
            </ul>
          `
        },
        {
          title: 'Liabilities',
          content: `
            <p>Liabilities are obligations that a company owes to others. They represent claims against the company's assets.</p>
            
            <p><strong>Current Liabilities:</strong> Obligations due within one year.</p>
            <ul>
              <li><strong>Accounts Payable</strong>: Money owed to suppliers</li>
              <li><strong>Short-term Debt</strong>: Loans due within a year</li>
              <li><strong>Accrued Expenses</strong>: Expenses incurred but not yet paid</li>
              <li><strong>Deferred Revenue</strong>: Payments received for products/services not yet delivered</li>
            </ul>
            
            <p><strong>Non-Current Liabilities:</strong> Long-term obligations.</p>
            <ul>
              <li><strong>Long-term Debt</strong>: Loans due after more than a year</li>
              <li><strong>Pension Liabilities</strong>: Future obligations to employees</li>
              <li><strong>Deferred Tax Liabilities</strong>: Taxes to be paid in the future</li>
            </ul>
          `
        },
        {
          title: 'Equity',
          content: `
            <p>Equity, also known as shareholders' equity or owners' equity, represents the owners' residual interest in the company's assets after deducting liabilities. It includes:</p>
            
            <ul>
              <li><strong>Common Stock</strong>: Value of shares issued to investors</li>
              <li><strong>Retained Earnings</strong>: Accumulated profits not distributed to shareholders</li>
              <li><strong>Additional Paid-in Capital</strong>: Excess amount paid by investors over the par value of shares</li>
              <li><strong>Treasury Stock</strong>: Company's own shares that have been repurchased (shown as a negative value)</li>
            </ul>
            
            <p>Equity essentially shows how much of the company belongs to its owners.</p>
          `
        }
      ]
    },
    {
      id: 'income-statement',
      title: 'The Income Statement',
      description: 'Learn how revenues, expenses, and profits are reported over time.',
      icon: BookOpen,
      duration: '7 min',
      sections: [
        {
          title: 'Income Statement Overview',
          content: `
            <p>The income statement, also called the profit and loss statement (P&L), shows a company's revenues, expenses, and profits over a specific period of time, such as a quarter or a year.</p>
            
            <p>While the balance sheet is a snapshot at a point in time, the income statement shows performance over a period. It answers the question: "Did the company make a profit or loss during this period?"</p>
          `
        },
        {
          title: 'Revenue',
          content: `
            <p>Revenue, also called sales, is the income generated from a company's normal business operations. It represents the top line of the income statement.</p>
            
            <p>Types of revenue include:</p>
            <ul>
              <li><strong>Sales Revenue</strong>: Income from selling products or services</li>
              <li><strong>Service Revenue</strong>: Income from providing services</li>
              <li><strong>Interest Revenue</strong>: Income from lending money or investments</li>
            </ul>
            
            <p>Revenue is recognized when it is earned, which may be different from when cash is received. This distinction is important in understanding the relationship between the income statement and cash flow statement.</p>
          `
        },
        {
          title: 'Expenses',
          content: `
            <p>Expenses are costs incurred to generate revenue. Major expense categories include:</p>
            
            <ul>
              <li><strong>Cost of Goods Sold (COGS)</strong>: Direct costs of producing goods or services</li>
              <li><strong>Operating Expenses</strong>:
                <ul>
                  <li>Salaries and wages</li>
                  <li>Rent and utilities</li>
                  <li>Marketing and advertising</li>
                  <li>Depreciation and amortization</li>
                </ul>
              </li>
              <li><strong>Interest Expense</strong>: Cost of borrowing money</li>
              <li><strong>Tax Expense</strong>: Income taxes</li>
            </ul>
            
            <p>Like revenue, expenses are recognized when they are incurred, not necessarily when they are paid.</p>
          `
        },
        {
          title: 'Profitability Measures',
          content: `
            <p>The income statement includes several key profitability measures:</p>
            
            <ul>
              <li><strong>Gross Profit</strong> = Revenue - Cost of Goods Sold</li>
              <li><strong>Operating Income</strong> = Gross Profit - Operating Expenses</li>
              <li><strong>Income Before Tax</strong> = Operating Income + Other Income - Interest Expense</li>
              <li><strong>Net Income</strong> = Income Before Tax - Tax Expense</li>
            </ul>
            
            <p>Net income, also called the bottom line, represents the company's profit after all expenses have been deducted from revenues. It flows into the balance sheet as an increase to retained earnings.</p>
          `
        }
      ]
    },
    {
      id: 'cash-flow',
      title: 'The Cash Flow Statement',
      description: 'Explore how cash moves in and out of a business.',
      icon: BookOpen,
      duration: '7 min',
      sections: [
        {
          title: 'Cash Flow Statement Overview',
          content: `
            <p>The cash flow statement tracks the actual flow of cash into and out of a business over a specific period. It explains the changes in a company's cash balance.</p>
            
            <p>While the income statement shows profitability and the balance sheet shows financial position, the cash flow statement reveals liquidity – the company's ability to generate and use cash.</p>
            
            <p>This statement is particularly important because a company can be profitable on paper (according to the income statement) but still face cash flow problems that could lead to insolvency.</p>
          `
        },
        {
          title: 'Operating Activities',
          content: `
            <p>Cash flows from operating activities are related to the company's main business operations. This section shows how much cash is generated from selling products or services.</p>
            
            <p>It starts with net income from the income statement and adjusts for:</p>
            <ul>
              <li><strong>Non-cash items</strong> (like depreciation and amortization)</li>
              <li><strong>Changes in working capital</strong> (like increases or decreases in accounts receivable, inventory, and accounts payable)</li>
            </ul>
            
            <p>Strong, positive operating cash flow is generally a good sign of a healthy business, as it indicates the core operations are generating cash.</p>
          `
        },
        {
          title: 'Investing Activities',
          content: `
            <p>Cash flows from investing activities show cash used for or generated from long-term assets and investments.</p>
            
            <p>Common investing activities include:</p>
            <ul>
              <li><strong>Purchase of property, plant, and equipment</strong> (negative cash flow)</li>
              <li><strong>Sale of property, plant, and equipment</strong> (positive cash flow)</li>
              <li><strong>Purchase of investments</strong> (negative cash flow)</li>
              <li><strong>Sale of investments</strong> (positive cash flow)</li>
            </ul>
            
            <p>Growing companies often have negative cash flow from investing activities as they expand their operations by purchasing assets.</p>
          `
        },
        {
          title: 'Financing Activities',
          content: `
            <p>Cash flows from financing activities relate to funding the company and returning money to investors.</p>
            
            <p>These include:</p>
            <ul>
              <li><strong>Issuance of stock</strong> (positive cash flow)</li>
              <li><strong>Repurchase of stock</strong> (negative cash flow)</li>
              <li><strong>Borrowing money</strong> (positive cash flow)</li>
              <li><strong>Repayment of debt</strong> (negative cash flow)</li>
              <li><strong>Payment of dividends</strong> (negative cash flow)</li>
            </ul>
            
            <p>The financing section reveals how a company is managing its capital structure – the mix of debt and equity used to finance its operations and growth.</p>
          `
        }
      ]
    },
    {
      id: 'statement-relationships',
      title: 'How Financial Statements Connect',
      description: 'Understand the interconnections between the three primary financial statements.',
      icon: BookOpen,
      duration: '10 min',
      sections: [
        {
          title: 'Statement Connections Overview',
          content: `
            <p>Financial statements do not exist in isolation – they are deeply interconnected, with changes in one statement affecting the others. Understanding these connections is crucial for comprehensive financial analysis.</p>
            
            <p>The diagram below illustrates the key relationships between the balance sheet, income statement, and cash flow statement:</p>
            
            <div class="my-6 h-[400px]">
              <StatementFlowDiagram height={400} />
            </div>
          `
        },
        {
          title: 'Income Statement to Balance Sheet',
          content: `
            <p>The primary connection between the income statement and balance sheet is through retained earnings:</p>
            
            <ul>
              <li>Net income from the income statement increases retained earnings on the balance sheet</li>
              <li>Dividend payments (which don't appear on the income statement) decrease retained earnings</li>
            </ul>
            
            <p>The formula for this connection is:</p>
            <div class="text-center my-4">
              <strong>Ending Retained Earnings = Beginning Retained Earnings + Net Income - Dividends</strong>
            </div>
            
            <p>Additionally, specific line items in the income statement might directly affect balance sheet accounts. For example:</p>
            <ul>
              <li>Credit sales increase accounts receivable</li>
              <li>Accrued expenses increase liabilities</li>
              <li>Prepaid expenses decrease assets as they're used up</li>
            </ul>
          `
        },
        {
          title: 'Balance Sheet to Cash Flow Statement',
          content: `
            <p>The cash flow statement explains the change in the cash balance from one balance sheet to the next. Additionally:</p>
            
            <ul>
              <li>Changes in non-cash current assets and current liabilities affect operating cash flow
                <ul>
                  <li>An increase in accounts receivable reduces cash flow (customers owe more money)</li>
                  <li>A decrease in inventory increases cash flow (inventory was sold for cash)</li>
                  <li>An increase in accounts payable increases cash flow (supplier payments deferred)</li>
                </ul>
              </li>
              <li>Changes in long-term assets appear in the investing section
                <ul>
                  <li>Purchases of fixed assets reduce cash flow</li>
                  <li>Sales of fixed assets increase cash flow</li>
                </ul>
              </li>
              <li>Changes in long-term debt and equity accounts appear in the financing section
                <ul>
                  <li>New borrowing increases cash flow</li>
                  <li>Debt repayment reduces cash flow</li>
                  <li>Stock issuance increases cash flow</li>
                </ul>
              </li>
            </ul>
          `
        },
        {
          title: 'Income Statement to Cash Flow Statement',
          content: `
            <p>The cash flow statement begins with net income from the income statement and reconciles it to actual cash flow through various adjustments:</p>
            
            <ul>
              <li>Non-cash expenses (like depreciation) are added back to net income</li>
              <li>Non-cash revenues are subtracted</li>
              <li>Changes in working capital accounts (from the balance sheet) are added or subtracted</li>
            </ul>
            
            <p>This reconciliation explains why a profitable company might still have cash flow problems, or why a company reporting losses might still generate positive cash flow.</p>
          `
        },
        {
          title: 'The Complete Picture',
          content: `
            <p>Together, these three statements provide a comprehensive view of a company's financial health:</p>
            
            <ul>
              <li><strong>Balance Sheet</strong>: Financial position (assets, liabilities, equity) at a point in time</li>
              <li><strong>Income Statement</strong>: Profitability over a period of time</li>
              <li><strong>Cash Flow Statement</strong>: Cash generation and usage over a period of time</li>
            </ul>
            
            <p>Analyzing all three statements together allows for a much deeper understanding than looking at any one statement in isolation. For example:</p>
            
            <ul>
              <li>A company with strong profits but weak cash flow might have issues collecting from customers or might be investing heavily in growth</li>
              <li>A company with weak profits but strong cash flow might be selling off assets or raising capital</li>
              <li>A company with a deteriorating balance sheet but strong income statement might be taking on too much debt to finance operations</li>
            </ul>
            
            <p>Understanding these interconnections is essential for investors, managers, creditors, and anyone else making decisions based on financial information.</p>
          `
        }
      ]
    },
    {
      id: 'financial-analysis',
      title: 'Financial Statement Analysis',
      description: 'Learn techniques for analyzing financial statements and calculating key ratios.',
      icon: BookOpen,
      duration: '12 min',
      sections: [
        {
          title: 'Introduction to Financial Analysis',
          content: `
            <p>Financial statement analysis is the process of examining a company's financial statements to assess its performance, stability, and growth potential. It helps stakeholders make informed decisions about investing, lending, or managing a business.</p>
            
            <p>Key approaches to financial analysis include:</p>
            <ul>
              <li><strong>Horizontal Analysis</strong>: Comparing financial data over time to identify trends</li>
              <li><strong>Vertical Analysis</strong>: Expressing each line item as a percentage of a base figure</li>
              <li><strong>Ratio Analysis</strong>: Calculating financial ratios to evaluate performance</li>
              <li><strong>Cash Flow Analysis</strong>: Examining the sources and uses of cash</li>
            </ul>
            
            <p>In this module, we'll focus primarily on ratio analysis, which provides standardized metrics to assess a company's financial health.</p>
          `
        },
        {
          title: 'Liquidity Ratios',
          content: `
            <p>Liquidity ratios measure a company's ability to meet short-term obligations and convert assets to cash quickly.</p>
            
            <ul>
              <li>
                <strong>Current Ratio</strong>
                <div class="my-2">Current Assets ÷ Current Liabilities</div>
                <div class="text-sm text-slate-600 mb-4">Measures the company's ability to pay short-term obligations. A ratio above 1 indicates that the company has more current assets than current liabilities.</div>
              </li>
              
              <li>
                <strong>Quick Ratio (Acid-Test Ratio)</strong>
                <div class="my-2">(Cash + Short-term Investments + Accounts Receivable) ÷ Current Liabilities</div>
                <div class="text-sm text-slate-600 mb-4">A more stringent measure of liquidity that excludes inventory and prepaid expenses. It shows the company's ability to pay short-term obligations without relying on inventory sales.</div>
              </li>
              
              <li>
                <strong>Cash Ratio</strong>
                <div class="my-2">(Cash + Cash Equivalents) ÷ Current Liabilities</div>
                <div class="text-sm text-slate-600 mb-4">The most conservative liquidity ratio, showing the company's ability to cover short-term liabilities with only its most liquid assets.</div>
              </li>
            </ul>
          `
        },
        {
          title: 'Profitability Ratios',
          content: `
            <p>Profitability ratios measure a company's ability to generate profits relative to its revenue, assets, or equity.</p>
            
            <ul>
              <li>
                <strong>Gross Profit Margin</strong>
                <div class="my-2">Gross Profit ÷ Revenue</div>
                <div class="text-sm text-slate-600 mb-4">Shows the percentage of revenue that exceeds the cost of goods sold. It indicates the efficiency of the company's production process.</div>
              </li>
              
              <li>
                <strong>Operating Profit Margin</strong>
                <div class="my-2">Operating Income ÷ Revenue</div>
                <div class="text-sm text-slate-600 mb-4">Measures the percentage of revenue that remains after covering operating expenses but before interest and taxes.</div>
              </li>
              
              <li>
                <strong>Net Profit Margin</strong>
                <div class="my-2">Net Income ÷ Revenue</div>
                <div class="text-sm text-slate-600 mb-4">Shows the percentage of revenue that translates into profit after all expenses are deducted.</div>
              </li>
              
              <li>
                <strong>Return on Assets (ROA)</strong>
                <div class="my-2">Net Income ÷ Average Total Assets</div>
                <div class="text-sm text-slate-600 mb-4">Measures how efficiently a company uses its assets to generate profits.</div>
              </li>
              
              <li>
                <strong>Return on Equity (ROE)</strong>
                <div class="my-2">Net Income ÷ Average Shareholders' Equity</div>
                <div class="text-sm text-slate-600 mb-4">Shows how effectively a company uses its equity to generate profits.</div>
              </li>
            </ul>
          `
        },
        {
          title: 'Solvency Ratios',
          content: `
            <p>Solvency ratios measure a company's ability to meet long-term obligations and assess its capital structure.</p>
            
            <ul>
              <li>
                <strong>Debt-to-Equity Ratio</strong>
                <div class="my-2">Total Liabilities ÷ Total Equity</div>
                <div class="text-sm text-slate-600 mb-4">Shows the proportion of company financing that comes from creditors versus shareholders. A higher ratio indicates higher leverage and potentially higher risk.</div>
              </li>
              
              <li>
                <strong>Debt-to-Assets Ratio</strong>
                <div class="my-2">Total Liabilities ÷ Total Assets</div>
                <div class="text-sm text-slate-600 mb-4">Indicates the percentage of a company's assets that are financed through debt.</div>
              </li>
              
              <li>
                <strong>Interest Coverage Ratio</strong>
                <div class="my-2">Operating Income ÷ Interest Expense</div>
                <div class="text-sm text-slate-600 mb-4">Measures a company's ability to pay interest on its debt. A higher ratio suggests the company can easily cover its interest obligations.</div>
              </li>
            </ul>
          `
        },
        {
          title: 'Efficiency Ratios',
          content: `
            <p>Efficiency ratios measure how well a company uses its assets and manages its liabilities to generate sales and maximize profits.</p>
            
            <ul>
              <li>
                <strong>Asset Turnover Ratio</strong>
                <div class="my-2">Revenue ÷ Average Total Assets</div>
                <div class="text-sm text-slate-600 mb-4">Measures how efficiently a company uses its assets to generate sales.</div>
              </li>
              
              <li>
                <strong>Inventory Turnover Ratio</strong>
                <div class="my-2">Cost of Goods Sold ÷ Average Inventory</div>
                <div class="text-sm text-slate-600 mb-4">Shows how many times a company's inventory is sold and replaced over a period.</div>
              </li>
              
              <li>
                <strong>Accounts Receivable Turnover Ratio</strong>
                <div class="my-2">Revenue ÷ Average Accounts Receivable</div>
                <div class="text-sm text-slate-600 mb-4">Indicates how efficiently a company collects payments from customers.</div>
              </li>
              
              <li>
                <strong>Days Sales Outstanding (DSO)</strong>
                <div class="my-2">365 ÷ Accounts Receivable Turnover Ratio</div>
                <div class="text-sm text-slate-600 mb-4">Shows the average number of days it takes to collect payment after a sale is made.</div>
              </li>
            </ul>
          `
        }
      ]
    }
  ];
  
  // Current topic and section
  let currentTopicId = $learningState.currentTopic;
  let currentSectionIndex = 0;
  
  $: currentTopic = topics.find(topic => topic.id === currentTopicId) || topics[0];
  $: currentSection = currentTopic.sections[currentSectionIndex];
  $: progress = ((currentSectionIndex + 1) / currentTopic.sections.length) * 100;
  
  // Handle topic change
  function changeTopic(topicId) {
    currentTopicId = topicId;
    currentSectionIndex = 0;
    // Update store
    learningState.update(state => ({
      ...state,
      currentTopic: topicId
    }));
  }
  
  // Navigate to next section
  function nextSection() {
    if (currentSectionIndex < currentTopic.sections.length - 1) {
      currentSectionIndex++;
    } else {
      // Mark topic as completed
      learningState.update(state => {
        if (!state.completedTopics.includes(currentTopic.id)) {
          return {
            ...state,
            completedTopics: [...state.completedTopics, currentTopic.id]
          };
        }
        return state;
      });
      
      // Find next uncompleted topic
      const nextTopicIndex = topics.findIndex(topic => topic.id === currentTopic.id) + 1;
      if (nextTopicIndex < topics.length) {
        changeTopic(topics[nextTopicIndex].id);
      }
    }
  }
  
  // Navigate to previous section
  function prevSection() {
    if (currentSectionIndex > 0) {
      currentSectionIndex--;
    } else {
      // Go to previous topic if at beginning of current topic
      const currentTopicIndex = topics.findIndex(topic => topic.id === currentTopic.id);
      if (currentTopicIndex > 0) {
        const prevTopic = topics[currentTopicIndex - 1];
        changeTopic(prevTopic.id);
        currentSectionIndex = prevTopic.sections.length - 1;
      }
    }
  }
  
  // Check if topic is completed
  function isTopicCompleted(topicId) {
    return $learningState.completedTopics.includes(topicId);
  }
  
  onMount(() => {
    // Initialize with default if not set
    if (!currentTopicId) {
      changeTopic('intro');
    }
  });
</script>

<div>
  <h1 class="text-2xl font-bold mb-6">Learning Center</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Topics sidebar -->
    <div class="lg:col-span-1">
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h3 class="text-lg font-semibold mb-4">Topics</h3>
        
        <div class="space-y-2">
          {#each topics as topic}
            <button 
              class="w-full p-3 text-left rounded-md transition flex items-center justify-between border"
              class:border-primary={currentTopicId === topic.id}
              class:bg-blue-50={currentTopicId === topic.id}
              class:border-slate-200={currentTopicId !== topic.id}
              class:hover:bg-slate-50={currentTopicId !== topic.id}
              on:click={() => changeTopic(topic.id)}
            >
              <div class="flex items-center">
                <svelte:component this={topic.icon} size={18} class="mr-2 text-slate-500" />
                <span class="font-medium">{topic.title}</span>
              </div>
              
              {#if isTopicCompleted(topic.id)}
                <span class="flex items-center text-green-500">
                  <Check size={16} />
                </span>
              {/if}
            </button>
          {/each}
        </div>
        
        <div class="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div class="flex items-start">
            <HelpCircle size={20} class="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm text-slate-700">
                Learn at your own pace. Each topic builds on previous ones to help you understand how financial statements work together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Content area -->
    <div class="lg:col-span-3">
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <!-- Topic header -->
        <div class="mb-6">
          <h2 class="text-xl font-bold">{currentTopic.title}</h2>
          <p class="text-slate-500 mt-1">{currentTopic.description}</p>
          
          <div class="flex items-center mt-3">
            <div class="text-sm text-slate-500 flex items-center">
              <BookOpen size={16} class="mr-1" />
              {currentTopic.duration} read
            </div>
            
            <div class="ml-4 text-sm text-slate-500">
              Section {currentSectionIndex + 1} of {currentTopic.sections.length}
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary rounded-full transition-all duration-300"
              style="width: {progress}%"
            ></div>
          </div>
        </div>
        
        <!-- Section content -->
        <div class="prose max-w-none mb-6">
          <h3 class="text-lg font-medium mb-4">{currentSection.title}</h3>
          <div class="learning-content">
            {@html currentSection.content}
          </div>
        </div>
        
        <!-- Navigation buttons -->
        <div class="flex justify-between mt-8">
          <button 
            class="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={prevSection}
            disabled={currentSectionIndex === 0 && topics.findIndex(t => t.id === currentTopic.id) === 0}
          >
            <ChevronRight size={18} class="mr-1 transform rotate-180" />
            Previous
          </button>
          
          <button 
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition flex items-center"
            on:click={nextSection}
          >
            {currentSectionIndex < currentTopic.sections.length - 1 ? 'Next' : 'Complete & Continue'}
            <ArrowRight size={18} class="ml-1" />
          </button>
        </div>
      </div>
      
      <!-- Related concepts -->
      <div class="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Related Concepts</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-slate-200 rounded-md p-4 hover:bg-slate-50 transition cursor-pointer">
            <h4 class="font-medium">Financial Ratios</h4>
            <p class="text-sm text-slate-500 mt-1">Learn how to calculate and interpret key financial ratios</p>
          </div>
          
          <div class="border border-slate-200 rounded-md p-4 hover:bg-slate-50 transition cursor-pointer">
            <h4 class="font-medium">Transaction Types</h4>
            <p class="text-sm text-slate-500 mt-1">Explore how different transactions affect financial statements</p>
          </div>
          
          <div class="border border-slate-200 rounded-md p-4 hover:bg-slate-50 transition cursor-pointer">
            <h4 class="font-medium">Statement Analysis</h4>
            <p class="text-sm text-slate-500 mt-1">Techniques for analyzing financial statements</p>
          </div>
          
          <div class="border border-slate-200 rounded-md p-4 hover:bg-slate-50 transition cursor-pointer">
            <h4 class="font-medium">Accounting Principles</h4>
            <p class="text-sm text-slate-500 mt-1">Fundamental concepts behind financial reporting</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Style for the content area */
  :global(.learning-content ul) {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  :global(.learning-content ul li) {
    margin-bottom: 0.5rem;
  }
  
  :global(.learning-content p) {
    margin-bottom: 1rem;
  }
</style>