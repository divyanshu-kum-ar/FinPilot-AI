import { useEffect } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useAIInsights from "../hooks/useAIInsights";
import { Sparkles, Brain, AlertTriangle, BarChart3, RefreshCw } from "lucide-react";

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
    <div className="space-y-6 text-slate-100">
      {/* Generate AI Summary Button */}
      <button
        onClick={refetch}
        disabled={loading || isRateLimited}
        className="w-full px-5 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
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
            <span>Analyzing Your Finances...</span>
          </div>
        ) : isRateLimited ? (
          `Retry in ${formatCountdown(retryAfter)}`
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4.5 w-4.5" />
            <span>Generate AI Summary</span>
          </div>
        )}
      </button>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 animate-pulse">
          <div className="h-4 bg-indigo-500/10 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-500/10 rounded"></div>
          <div className="h-4 bg-indigo-500/10 rounded w-5/6"></div>
          <div className="h-4 bg-indigo-500/10 rounded w-2/3"></div>
        </div>
      )}

      {/* Rate-limit / quota banner */}
      {isRateLimited && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-bold text-amber-400 text-sm">
                AI Quota Exceeded
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                The free-tier Gemini API daily limit has been reached.
                Button will re-enable automatically in{" "}
                <span className="font-bold text-amber-400">{formatCountdown(retryAfter)}</span>.
              </p>
              <p className="text-[10px] text-slate-500 mt-2">
                Tip: To avoid quota issues, consider upgrading to a paid Gemini API plan or
                switching to a different model (e.g. <code>gemini-1.5-flash</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generic error (non-rate-limit) */}
      {error && !isRateLimited && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Fallback financial summary when quota is exceeded */}
      {summary && !loading && (
        <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 shadow-inner">
          <p className="font-bold text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <BarChart3 className="h-4.5 w-4.5" />
            <span>Your Financial Snapshot (AI Limit Active)</span>
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-sm">
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1">Total Income</p>
              <p className="text-lg font-bold text-green-400">
                {formatRupees(summary.totalIncome)}
              </p>
            </div>
            
            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-sm">
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1">Total Expenses</p>
              <p className="text-lg font-bold text-red-400">
                {formatRupees(summary.totalExpenses)}
              </p>
            </div>
            
            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-sm">
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1">Net Savings</p>
              <p
                className={`text-lg font-bold ${
                  summary.netSavings >= 0
                    ? "text-indigo-400"
                    : "text-red-400"
                }`}
              >
                {formatRupees(summary.netSavings)}
              </p>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-sm">
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1">Savings Rate</p>
              <p className="text-lg font-bold text-amber-400">
                {summary.savingsRate}%
              </p>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-sm">
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1">Avg Monthly Income</p>
              <p className="text-lg font-bold text-green-400">
                {formatRupees(Math.round(summary.avgMonthlyIncome))}
              </p>
            </div>

            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 shadow-sm">
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mb-1">Avg Monthly Spend</p>
              <p className="text-lg font-bold text-red-400">
                {formatRupees(Math.round(summary.avgMonthlyExpenses))}
              </p>
            </div>
          </div>

          {/* Top categories in summary */}
          {summary.topCategories && summary.topCategories.length > 0 && (
            <div className="mt-6 border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
                Top Expense Categories
              </p>
              <div className="space-y-2">
                {summary.topCategories.map((cat, i) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between text-xs p-2.5 bg-slate-900/20 rounded-lg"
                  >
                    <span className="text-slate-300">
                      {i + 1}. {cat.category}
                    </span>
                    <span className="font-semibold text-white">
                      {formatRupees(cat.amount)}{" "}
                      <span className="text-slate-400 text-[10px] font-normal">
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
      {insights && !loading && (
        <div className="p-6 border rounded-2xl bg-[#090e1a]/80 border-indigo-500/10 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient highlights */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-400" />
              <h4 className="font-bold text-white text-base">FinPilot AI Analysis</h4>
            </div>
            <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
              Verified
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-h1:text-lg prose-h1:mt-4 prose-h1:mb-2
              prose-h2:text-base prose-h2:mt-3 prose-h2:mb-2
              prose-h3:text-sm prose-h3:mt-2 prose-h3:mb-1
              prose-p:text-slate-200 prose-p:my-2 prose-p:leading-relaxed
              prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2
              prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2
              prose-li:my-1 prose-li:text-slate-200
              prose-strong:text-white
              prose-em:text-slate-300
              prose-code:bg-white/5 prose-code:text-indigo-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-table:text-xs prose-th:bg-white/5 dark:prose-th:bg-white/5 prose-td:border-white/5
              prose-a:text-indigo-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {insights}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
