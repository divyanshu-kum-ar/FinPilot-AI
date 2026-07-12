import { motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit3,
  Filter,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import TransactionForm from "./TransactionForm";

const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { transactions, deleteTransaction } = useTransactions();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "income" | "expense"
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterAmountMin, setFilterAmountMin] = useState("");
  const [filterAmountMax, setFilterAmountMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Unique categories derived from loaded transactions
  const allCategories = useMemo(() => {
    const cats = [...new Set(transactions.map((t) => t.category))].sort();
    return cats;
  }, [transactions]);

  // ── Apply filters ─────────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search by category text
      if (
        searchText &&
        !t.category.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false;
      }
      // Type filter
      if (filterType !== "all" && t.type !== filterType) {
        return false;
      }
      // Category dropdown
      if (filterCategory && t.category !== filterCategory) {
        return false;
      }
      // Date range
      if (filterDateFrom) {
        const txDate = new Date(t.date);
        const fromDate = new Date(filterDateFrom);
        if (txDate < fromDate) return false;
      }
      if (filterDateTo) {
        const txDate = new Date(t.date);
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999); // include the whole "to" day
        if (txDate > toDate) return false;
      }
      // Amount range
      if (filterAmountMin !== "" && t.amount < parseFloat(filterAmountMin)) {
        return false;
      }
      if (filterAmountMax !== "" && t.amount > parseFloat(filterAmountMax)) {
        return false;
      }
      return true;
    });
  }, [
    transactions,
    searchText,
    filterType,
    filterCategory,
    filterDateFrom,
    filterDateTo,
    filterAmountMin,
    filterAmountMax,
  ]);

  const hasActiveFilters =
    searchText ||
    filterType !== "all" ||
    filterCategory ||
    filterDateFrom ||
    filterDateTo ||
    filterAmountMin !== "" ||
    filterAmountMax !== "";

  const resetFilters = () => {
    setSearchText("");
    setFilterType("all");
    setFilterCategory("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterAmountMin("");
    setFilterAmountMax("");
  };

  // Separate income and expense transactions (from filtered set)
  const incomeTransactions = filteredTransactions
    .filter((t) => t.type === "income")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const expenseTransactions = filteredTransactions
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Handle edit
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Card for each transaction type
  const renderCard = (title, data, color, Icon, delay = 0) => {
    const total = data.reduce((sum, t) => sum + t.amount, 0);
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-lg font-semibold flex items-center gap-2 ${color}`}
          >
            <Icon className="w-5 h-5" /> {title}
          </h2>
          <span className="text-sm text-gray-500">
            {data.length} {title.toLowerCase()}
          </span>
        </div>

        {data.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No {title.toLowerCase()} yet.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((t) => (
                <motion.li
                  key={t._id || t.id}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 transition"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Left: category + date */}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {t.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(t.date).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}₹
                      {t.amount.toLocaleString("en-IN")}
                    </span>

                    <motion.button
                      onClick={() => handleEdit(t)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit3 className="w-4 h-4 text-blue-500" />
                    </motion.button>
                    <motion.button
                      onClick={() => deleteTransaction(t._id || t.id)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Total {title.split(" ")[0]}
                </span>
                <span className={`font-bold text-lg ${color}`}>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Transactions
        </h1>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
              showFilters || hasActiveFilters
                ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-400 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            whileHover={{ scale: 1.03 }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </motion.button>
          <motion.button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Transaction
          </motion.button>
        </div>
      </div>

      {/* Search bar (always visible) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by category…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapsible filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Amount Min */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Min Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filterAmountMin}
                onChange={(e) => setFilterAmountMin(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Amount Max */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Max Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={filterAmountMax}
                onChange={(e) => setFilterAmountMax(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Active filter summary */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </p>
      )}

      {/* Cards for income + expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCard(
          "Income Transactions",
          incomeTransactions,
          "text-green-600 dark:text-green-400",
          ArrowUpCircle,
          0
        )}
        {renderCard(
          "Expense Transactions",
          expenseTransactions,
          "text-red-600 dark:text-red-400",
          ArrowDownCircle,
          0.2
        )}
      </div>

      {/* Modal Form (for add + edit) */}
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default Transactions;
