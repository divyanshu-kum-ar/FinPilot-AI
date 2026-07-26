// Refactored aiController.js for clarity and simplicity

const Transaction = require('../models/Transaction');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiReportTemplate = require('../templates/aiReportTemplate');

// Helper to extract retryDelay seconds from Gemini error details
const extractRetryDelay = (error) => {
  try {
    if (error.errorDetails && Array.isArray(error.errorDetails)) {
      const retryInfo = error.errorDetails.find(
        (d) => d['@type'] && String(d['@type']).includes('RetryInfo')
      );
      if (retryInfo && retryInfo.retryDelay) {
        const m = String(retryInfo.retryDelay).match(/(\d+)/);
        if (m) return parseInt(m[1], 10) * 1000; // convert to ms
      }
    }
  } catch (e) { /* ignore */ }
  return null;
};

// Helper function for retry with exponential backoff
// Retries on 503 (overloaded) and short-lived 429 bursts (rate limit)
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt >= maxRetries - 1;

      if (error.status === 503 && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed with 503, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error.status === 429 && !isLastAttempt) {
        // Use the retry delay suggested by the API if available, otherwise backoff
        const suggestedDelay = extractRetryDelay(error);
        const delay = suggestedDelay !== null ? suggestedDelay : baseDelay * Math.pow(2, attempt);
        // Only auto-retry if the suggested wait is short (≤ 30s), otherwise propagate
        if (delay <= 30000) {
          console.log(`Attempt ${attempt + 1} failed with 429, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error; // quota daily limit – don't wait, surface to the caller
        }
      } else {
        throw error;
      }
    }
  }
};

// Helper to calculate totals and categorize transactions
const calculateSummary = (transactions) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryExpenses = {};
  const categoryIncome = {};
  const monthlySpending = {};
  const allTransactions = [];

  transactions.forEach(transaction => {
    const amount = transaction.amount;
    const category = transaction.category;
    const type = transaction.type;
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    allTransactions.push(transaction);

    if (type === 'income') {
      totalIncome += Math.abs(amount);
      categoryIncome[category] = (categoryIncome[category] || 0) + Math.abs(amount);
    } else {
      totalExpenses += Math.abs(amount);
      categoryExpenses[category] = (categoryExpenses[category] || 0) + Math.abs(amount);
    }

    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + Math.abs(amount);
  });

  return { totalIncome, totalExpenses, categoryExpenses, categoryIncome, monthlySpending, allTransactions };
};

// Helper to identify large transactions
const identifyLargeTransactions = (transactions, totalExpenses) => {
  return transactions.filter(transaction => {
    const absAmount = Math.abs(transaction.amount);
    return absAmount > Math.max(totalExpenses * 0.1, 5000);
  }).map(transaction => ({
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    date: transaction.date
  }));
};

// Helper to calculate top categories
const getTopCategories = (categoryExpenses, totalExpenses, topN = 3) => {
  return Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topN)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }));
};

// Main controller function
exports.getFinancialInsights = async (req, res) => {
  // Keep summary accessible to the catch block for graceful fallbacks
  let summaryData = null;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'AI service is not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: 'desc' }).limit(100);

    if (transactions.length < 5) {
      return res.status(400).json({ error: 'Not enough transaction data for an analysis.' });
    }

    // Calculate summary data
    const { totalIncome, totalExpenses, categoryExpenses, categoryIncome, monthlySpending, allTransactions } = calculateSummary(transactions);

    // Identify large transactions
    const largeTransactions = identifyLargeTransactions(allTransactions, totalExpenses);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Get top 3 expense categories
    const topCategories = getTopCategories(categoryExpenses, totalExpenses);

    // Calculate monthly averages
    const months = Object.keys(monthlySpending).length;
    const avgMonthlyIncome = totalIncome / months;
    const avgMonthlyExpenses = totalExpenses / months;

    summaryData = {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate: savingsRate.toFixed(1),
      categoryExpenses,
      categoryIncome,
      monthlySpending,
      largeTransactions,
      topCategories,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      transactionCount: transactions.length
    };

    // Simplified prompt for AI model
    const prompt = `
You are a financial expert and advisor. Analyze the following summarized financial data for a user (all amounts in Rupees) and provide clear, actionable financial insights.

Summary Data:
${JSON.stringify(summaryData, null, 2)}

Analysis Goals:
1. Provide a Financial Overview: Clearly state total income, total expenses, net savings/income, and monthly averages. Ensure expenses are broken down by category.
2. Analyze Spending Patterns by category with percentages and trends.
3. Identify the Top 3 expense categories with amounts and percentages.
4. Compare Income sources versus Expenses.
5. Calculate and comment on the Savings Rate.
6. Highlight any Irregular or large transactions.
7. Note Monthly Spending Trends.
8. Provide a detailed Expense Breakdown section listing all expense categories with amounts and percentages from the summary data.

Recommendations:
- Give 3-4 specific, actionable recommendations based on spending patterns.
- Include both short-term and long-term financial goals.
- Suggest budgeting strategies.
- Provide personalized tips based on the summarized data.

Formatting Instructions:
- Use clear markdown with headers and subheaders.
- Include specific amounts and percentages where relevant.
- Use bullet points and numbered lists for clarity.
- Maintain a professional yet encouraging tone.
- Make insights data-driven and specific to the user's financial summary.
- Ensure the Expense Breakdown section includes all relevant expense data from the summary, such as totalExpenses, categoryExpenses, and topCategories.

Response Format:
${aiReportTemplate}
`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const text = result.response.text();

    return res.status(200).json({ insights: text });

  } catch (error) {
    if (!error || error.status !== 429) {
      console.error('AI Insight Error:', error);
    }

    if (error && error.status === 429) {
      const retryDelayMs = extractRetryDelay(error);
      const retryAfterSeconds = retryDelayMs !== null ? Math.ceil(retryDelayMs / 1000) : null;

      if (summaryData) {
        const fallbackReport = formatSummaryToReport(summaryData);
        return res.status(200).json({
          insights: fallbackReport,
          warning: 'Returned fallback insights because the AI quota was exceeded.',
          retryAfterSeconds,
          summary: summaryData
        });
      }

      return res.status(429).json({
        error: 'AI quota exceeded',
        message: 'The AI service is temporarily rate-limited. Please try again shortly.',
        retryAfterSeconds
      });
    }

    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
};


// Build a readable markdown report from summary data when AI is unavailable
function formatSummaryToReport(summary) {
  const lines = [];
  lines.push('# 📊 Financial Overview');
  lines.push(`- Total Income: ₹${summary.totalIncome.toFixed(2)}`);
  lines.push(`- Total Expenses: ₹${summary.totalExpenses.toFixed(2)}`);
  lines.push(`- Net Savings: ₹${summary.netSavings.toFixed(2)}`);
  lines.push(`- Savings Rate: ${summary.savingsRate}%`);
  lines.push('');

  lines.push('## 💸 Expense Breakdown');
  lines.push(`- Total Expenses: ₹${summary.totalExpenses.toFixed(2)}`);
  lines.push('');
  lines.push('### Categories:');
  Object.entries(summary.categoryExpenses || {}).forEach(([cat, amt]) => {
    const pct = summary.totalExpenses > 0 ? ((amt / summary.totalExpenses) * 100).toFixed(1) : '0.0';
    lines.push(`- ${cat}: ₹${amt.toFixed(2)} (${pct}%)`);
  });
  lines.push('');

  lines.push('## 📈 Top Spending Categories');
  (summary.topCategories || []).forEach((t, i) => {
    lines.push(`${i + 1}. ${t.category}: ₹${t.amount.toFixed(2)} (${t.percentage}%)`);
  });
  lines.push('');

  lines.push('## 🎯 Recommendations');
  lines.push('- Review the top spending categories and identify 1 expense to reduce this month.');
  lines.push('- Set a target to increase savings by 5% of monthly income.');
  lines.push('- Build an emergency fund covering 3 months of expenses.');
  lines.push('');

  lines.push('## 📅 Monthly Insights');
  Object.entries(summary.monthlySpending || {}).forEach(([month, amt]) => {
    lines.push(`- ${month}: ₹${amt.toFixed(2)}`);
  });

  return lines.join('\n');
}
