import { useEffect } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useAIInsights from "../hooks/useAIInsights";

// Format a number of seconds into a mm:ss string
const formatCountdown = (secs) => {
  if (secs == null) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Format rupee amount
const formatRupees = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—";

const AIInsights = () => {
  const { insights, loading, error, retryAfter, summary, refetch } = useAIInsights();

  useEffect(() => {
    if (insights) {
      toast.success("AI insights generated successfully!");
    }
  }, [insights]);

  const isRateLimited = retryAfter !== null && retryAfter > 0;

  return (
    <div>
      {/* Generate button */}
      <button
        onClick={refetch}
        disabled={loading || isRateLimited}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed mb-4 transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Analyzing Your Finances...
          </div>
        ) : isRateLimited ? (
          `Retry in ${formatCountdown(retryAfter)}`
        ) : (
          "Generate AI Summary"
        )}
      </button>

      {/* Rate-limit / quota banner */}
      {isRateLimited && (
        <div className="mb-4 p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl select-none">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                AI Quota Exceeded
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                The free-tier Gemini API daily limit has been reached.
                Button will re-enable automatically in{" "}
                <span className="font-bold">{formatCountdown(retryAfter)}</span>.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                Tip: To avoid quota issues, consider upgrading to a paid Gemini API plan or
                switching to a different model (e.g. <code>gemini-1.5-flash</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generic error (non-rate-limit) */}
      {error && !isRateLimited && (
        <p className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded mb-4">
          {error}
        </p>
      )}

      {/* Fallback financial summary when quota is exceeded */}
      {summary && (
        <div className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <p className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <span>📊</span> Your Financial Summary (AI analysis unavailable)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Total Income</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                {formatRupees(summary.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Total Expenses</p>
              <p className="font-bold text-red-600 dark:text-red-400">
                {formatRupees(summary.totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Net Savings</p>
              <p
                className={`font-bold ${
                  summary.netSavings >= 0
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatRupees(summary.netSavings)}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Savings Rate</p>
              <p className="font-bold text-purple-600 dark:text-purple-400">
                {summary.savingsRate}%
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Avg Monthly Income</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                {formatRupees(Math.round(summary.avgMonthlyIncome))}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Avg Monthly Spend</p>
              <p className="font-bold text-red-600 dark:text-red-400">
                {formatRupees(Math.round(summary.avgMonthlyExpenses))}
              </p>
            </div>
          </div>

          {/* Top categories */}
          {summary.topCategories && summary.topCategories.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                🏷️ Top Expense Categories
              </p>
              <div className="space-y-2">
                {summary.topCategories.map((cat, i) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {i + 1}. {cat.category}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatRupees(cat.amount)}{" "}
                      <span className="text-gray-500 dark:text-gray-400">
                        ({cat.percentage}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI insights output — rendered as Markdown */}
      {insights && (
        <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h1:text-xl prose-h1:mt-4 prose-h1:mb-2
              prose-h2:text-lg prose-h2:mt-3 prose-h2:mb-2
              prose-h3:text-base prose-h3:mt-2 prose-h3:mb-1
              prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:my-1
              prose-ul:list-disc prose-ul:pl-5 prose-ul:my-1
              prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-1
              prose-li:my-0.5 prose-li:text-gray-800 dark:prose-li:text-gray-200
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-em:text-gray-700 dark:prose-em:text-gray-300
              prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-code:text-sm
              prose-table:text-sm prose-th:bg-gray-100 dark:prose-th:bg-gray-700
              prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
          >
            {insights}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
