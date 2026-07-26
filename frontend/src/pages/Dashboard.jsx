import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Calendar,
  IndianRupee,
  List,
  Percent,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BarChartComponent from "../components/charts/BarChartComponent";
import LineChartComponent from "../components/charts/LineChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTransactions } from "../context/TransactionContext";

const StatCard = ({ title, value, icon: Icon, color, pillBg, glowClass, delayIndex }) => {
  const isSavingsRate = title === "Savings Rate";
  const isTransactions = title === "Transactions";

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 14,
        delay: delayIndex * 0.08
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        y: -6, 
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4)",
        borderColor: "rgba(99, 102, 241, 0.25)"
      }}
      className="glass-card p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      {/* Background glow decoration on card hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl text-white shadow-md transition-all duration-300 group-hover:scale-110 ${color} ${glowClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">
          {isTransactions
            ? value
            : isSavingsRate
            ? `${value}%`
            : `₹${value.toLocaleString("en-IN")}`}
        </h3>
        
        <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider select-none border-t border-gray-100 dark:border-white/5 pt-3 group-hover:border-white/10 transition-colors">
          <span>Active Period</span>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-colors ${pillBg}`}>
            Monthly
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { transactions } = useTransactions();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Dynamic greeting message based on current time
  const getGreetingTime = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.displayName ? user.displayName.split(" ")[0] : "Divyanshu";

  // Stats
  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: income - expense,
      income,
      expense,
      totalTransactions: transactions.length,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    };
  }, [transactions]);

  // Monthly data for charts (last 12 months)
  const monthlyData = useMemo(() => {
    const dataByMonth = {};
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 11);

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (date >= startDate && date <= today) {
        const monthKey = date.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });
        if (!dataByMonth[monthKey]) {
          dataByMonth[monthKey] = { name: monthKey, income: 0, expense: 0 };
        }
        if (t.type === "income") {
          dataByMonth[monthKey].income += t.amount;
        } else {
          dataByMonth[monthKey].expense += t.amount;
        }
      }
    });

    const sortedMonths = Object.keys(dataByMonth).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });

    return sortedMonths.map((month) => dataByMonth[month]);
  }, [transactions]);

  // Daily data for line chart (last 30 days)
  const dailyData = useMemo(() => {
    const dataByDate = {};
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (date >= startDate && date <= today) {
        const dateKey = date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = { name: dateKey, income: 0, expense: 0 };
        }
        if (t.type === "income") {
          dataByDate[dateKey].income += t.amount;
        } else {
          dataByDate[dateKey].expense += t.amount;
        }
      }
    });

    const sortedDates = Object.keys(dataByDate).sort((a, b) => {
      const dateA = new Date(a + " 2023");
      const dateB = new Date(b + " 2023");
      return dateA - dateB;
    });

    return sortedDates.map((date) => dataByDate[date]);
  }, [transactions]);

  // Category-wise expenses
  const categoryData = useMemo(() => {
    const dataByCategory = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!dataByCategory[t.category]) {
          dataByCategory[t.category] = { name: t.category, value: 0 };
        }
        dataByCategory[t.category].value += t.amount;
      });
    return Object.values(dataByCategory);
  }, [transactions]);

  // Top 3 spending categories
  const topCategories = useMemo(() => {
    return [...categoryData].sort((a, b) => b.value - a.value).slice(0, 3);
  }, [categoryData]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const handleViewAllTransactions = () => {
    navigate("/transactions");
  };

  // Welcome Text Animations (Staggered words)
  const titleWords = ["Welcome", "back!"];

  const wordContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 15, letterSpacing: "-0.05em" },
    visible: { 
      opacity: 1, 
      y: 0,
      letterSpacing: "0em",
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 12
      }
    }
  };

  const nameVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { delay: 0.6, duration: 0.6 }
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100 relative">
      {/* Background Glow Mesh (Ambient Light Circles) */}
      <div className="bg-radial-mesh" />

      {/* Premium Hero Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[24px] p-6 md:p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-[#0c122c] via-[#080d21] to-[#04060f] text-white min-h-[300px] lg:min-h-[320px] flex flex-col lg:grid lg:grid-cols-12 gap-8 items-center w-full"
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        {/* Left Column: approximately 40% width (col-span-5) */}
        <div className="col-span-12 lg:col-span-5 space-y-4 text-center lg:text-left z-10 flex flex-col justify-center">
          <motion.p 
            variants={nameVariants}
            initial="hidden"
            animate="visible"
            className="text-xs font-extrabold text-indigo-300 tracking-wider uppercase select-none"
          >
            {getGreetingTime()}, {userName}! 👋
          </motion.p>
          
          {/* Animated Title Greeting */}
          <motion.h1 
            variants={wordContainerVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight flex flex-wrap justify-center lg:justify-start gap-x-2 select-none"
          >
            {titleWords.map((word, idx) => (
              <motion.span 
                key={word + idx} 
                variants={wordVariants}
                className={word === "back!" ? "bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent" : ""}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <p className="max-w-md text-slate-300 text-xs md:text-sm leading-relaxed">
            Here's your personalized financial snapshot for {new Date().toLocaleDateString(
              "en-IN",
              { month: "long", year: "numeric" }
            )}. Track, optimize, and grow with FinPilot AI.
          </p>

          {/* Dynamic Comparison Trend Pills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 select-none">
            <motion.div 
              whileHover={{ scale: 1.03, y: -1, boxShadow: "0 8px 20px -4px rgba(16, 185, 129, 0.15)" }}
              className="flex items-center gap-2 bg-[#101b23]/80 border border-emerald-500/20 rounded-xl p-2 pr-3 cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="text-left text-[10px]">
                <div className="flex items-center gap-1 font-bold text-emerald-400">
                  <span>12.5%</span>
                  <span className="text-[8px] text-slate-500 font-normal">vs last month</span>
                </div>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Income Increase</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.03, y: -1, boxShadow: "0 8px 20px -4px rgba(244, 63, 94, 0.15)" }}
              className="flex items-center gap-2 bg-[#1f1620]/80 border border-rose-500/20 rounded-xl p-2 pr-3 cursor-pointer"
            >
              <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
              <div className="text-left text-[10px]">
                <div className="flex items-center gap-1 font-bold text-rose-400">
                  <span>5.8%</span>
                  <span className="text-[8px] text-slate-500 font-normal">vs last month</span>
                </div>
                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Expense Decrease</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Info Cards (AI Insight & Financial Health Circular Gauge) */}
          <div className="grid grid-cols-2 gap-4 mt-3 select-none">
            {/* AI Insight Card */}
            <div className="bg-[#0a0f1d]/50 backdrop-blur-md border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg relative overflow-hidden h-[120px]">
              <div className="flex items-center gap-1 text-[8px] font-bold text-indigo-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>AI Insight</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-1">
                {/* Robot Avatar SVG */}
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                    <rect x="5" y="9" width="14" height="11" rx="3" />
                    <line x1="9" y1="13" x2="9" y2="13.01" strokeWidth="3" strokeLinecap="round" />
                    <line x1="15" y1="13" x2="15" y2="13.01" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 9 17 Q 12 19 15 17" strokeLinecap="round" />
                    <circle cx="12" cy="4" r="1.5" />
                    <line x1="12" y1="5.5" x2="12" y2="9" />
                    <path d="M 2 13 L 5 13" strokeLinecap="round" />
                    <path d="M 19 13 L 22 13" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-left text-[9px] leading-relaxed text-slate-300">
                  <p>You saved {stats.savingsRate.toFixed(0)}% of your income.</p>
                  <p className="text-emerald-400 font-extrabold mt-0.5">Great progress! 🎉</p>
                </div>
              </div>
            </div>

            {/* Financial Health Card */}
            <div className="bg-[#0a0f1d]/50 backdrop-blur-md border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg relative overflow-hidden h-[120px]">
              <div className="flex items-center gap-1 text-[8px] font-bold text-indigo-400 uppercase tracking-wider">
                <Activity className="h-3 w-3" />
                <span>Financial Health</span>
              </div>
              <div className="flex items-center justify-center gap-3.5 mt-1 flex-1">
                {/* Circular Gauge Ring */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <defs>
                      <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="3" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.915" 
                      fill="none" 
                      stroke="url(#healthGrad)" 
                      strokeWidth="3" 
                      strokeDasharray="100" 
                      strokeDashoffset={100 - Math.min(100, Math.max(0, stats.savingsRate))}
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-extrabold text-slate-100">{stats.savingsRate.toFixed(0)}%</span>
                </div>
                <div className="text-left">
                  <span className={`text-[9px] font-extrabold block ${
                    stats.savingsRate >= 50 ? "text-emerald-400" : stats.savingsRate >= 20 ? "text-cyan-400" : "text-rose-400"
                  }`}>
                    {stats.savingsRate >= 50 ? "Excellent" : stats.savingsRate >= 20 ? "Good" : "Needs Focus"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: approximately 60% width (col-span-7) with grid mesh */}
        <div className="col-span-12 lg:col-span-7 w-full flex flex-col justify-between gap-6 relative min-h-[300px]">
          {/* Top Horizontal Row: 4 Glassmorphic overview KPI chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full select-none z-10 pt-2 lg:pt-0">
            {/* Chip 1: Current Month */}
            <div className="bg-[#0b1021]/60 backdrop-blur-md border border-white/5 rounded-xl p-2 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <div className="text-left text-[9px] truncate">
                <span className="text-slate-200 font-bold block truncate">{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                <span className="text-slate-500 text-[8px] block">Monthly Overview</span>
              </div>
            </div>

            {/* Chip 2: Income */}
            <div className="bg-[#0b1021]/60 backdrop-blur-md border border-white/5 rounded-xl p-2 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="text-left text-[9px]">
                <span className="text-slate-200 font-bold block">₹{stats.income.toLocaleString("en-IN")}</span>
                <span className="text-emerald-400 text-[8px] block">+12% vs last month</span>
              </div>
            </div>

            {/* Chip 3: Expenses */}
            <div className="bg-[#0b1021]/60 backdrop-blur-md border border-white/5 rounded-xl p-2 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
              <div className="text-left text-[9px]">
                <span className="text-slate-200 font-bold block">₹{stats.expense.toLocaleString("en-IN")}</span>
                <span className="text-rose-400 text-[8px] block">-5% vs last month</span>
              </div>
            </div>

            {/* Chip 4: Savings Rate */}
            <div className="bg-[#0b1021]/60 backdrop-blur-md border border-white/5 rounded-xl p-2 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <Percent className="h-3.5 w-3.5" />
              </div>
              <div className="text-left text-[9px]">
                <span className="text-slate-200 font-bold block">{stats.savingsRate.toFixed(1)}%</span>
                <span className="text-slate-500 text-[8px] block">of income saved</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Visual Illustration & stacked widgets */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-6 justify-between relative min-h-[220px]">
            {/* Subtle grid pattern overlay restricted to right visual block */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] rounded-[20px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-cyan-500/5 blur-2xl rounded-[20px] pointer-events-none" />

            {/* Desktop & Tablet SVG Growth Chart Illustration */}
            <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 animate-float-widget-1 hidden sm:block">
              <defs>
                <linearGradient id="circleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#0b0f19" />
                </linearGradient>
                <linearGradient id="orbGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <radialGradient id="aiGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Grid Lines inside SVG */}
              <g opacity="0.08">
                <line x1="0" y1="20" x2="340" y2="20" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="340" y2="60" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="340" y2="100" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="340" y2="140" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="180" x2="340" y2="180" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />

                <line x1="30" y1="0" x2="30" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="70" y1="0" x2="70" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="110" y1="0" x2="110" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="150" y1="0" x2="150" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="190" y1="0" x2="190" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="230" y1="0" x2="230" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="270" y1="0" x2="270" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="310" y1="0" x2="310" y2="220" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
              </g>

              {/* Glowing Base Platform Podium */}
              <ellipse cx="230" cy="180" rx="90" ry="18" fill="#1e1b4b" opacity="0.3" />
              <ellipse cx="230" cy="176" rx="80" ry="15" fill="url(#platformGrad)" stroke="#06b6d4" strokeWidth="1.5" />
              <ellipse cx="230" cy="176" rx="65" ry="11" fill="#0b0f19" />

              {/* 6 Vertical Columns standing on the platform */}
              <g>
                <rect x="150" y="130" width="14" height="45" rx="3" fill="url(#barGrad)" className="animate-rise-up" style={{ animationDelay: '0.0s' }} />
                <rect x="175" y="110" width="14" height="65" rx="3" fill="url(#barGrad)" className="animate-rise-up" style={{ animationDelay: '0.1s' }} />
                <rect x="200" y="90" width="14" height="85" rx="3" fill="url(#barGrad)" className="animate-rise-up" style={{ animationDelay: '0.2s' }} />
                <rect x="225" y="70" width="14" height="105" rx="3" fill="url(#barGrad)" className="animate-rise-up" style={{ animationDelay: '0.3s' }} />
                <rect x="250" y="50" width="14" height="125" rx="3" fill="url(#barGrad)" className="animate-rise-up" style={{ animationDelay: '0.4s' }} />
                <rect x="275" y="25" width="14" height="150" rx="3" fill="url(#barGrad)" className="animate-rise-up" style={{ animationDelay: '0.5s' }} />
              </g>

              {/* Cyan curve path drawing on load */}
              <path 
                d="M 120 150 Q 210 110 282 30" 
                stroke="#00ffff" 
                strokeWidth="2.5" 
                fill="none"
                strokeDasharray="250"
                strokeDashoffset="250"
                className="animate-[drawLine_2s_ease-out_forwards]"
                style={{ animationDelay: '0.4s' }}
              />
              {/* Glowing nodes on path at intersection points */}
              <circle cx="157" cy="122" r="3" fill="#00ffff" className="animate-pulse" />
              <circle cx="182" cy="103" r="3" fill="#00ffff" className="animate-pulse" />
              <circle cx="207" cy="85" r="3" fill="#00ffff" className="animate-pulse" />
              <circle cx="232" cy="67" r="3" fill="#00ffff" className="animate-pulse" />
              <circle cx="257" cy="49" r="3" fill="#00ffff" className="animate-pulse" />
              <circle cx="282" cy="30" r="3.5" fill="#00ffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />

              {/* Large up-right pointing Arrowhead */}
              <polygon 
                points="282,30 258,35 272,12" 
                fill="#3b82f6" 
                className="animate-pulse"
              />

              {/* Glowing AI Atomic Orb near bottom-left of chart */}
              <g transform="translate(85, 155)" className="animate-breathing-glow">
                <circle cx="0" cy="0" r="30" fill="url(#aiGlowGrad)" opacity="0.35" />
                <ellipse cx="0" cy="0" rx="24" ry="7.5" stroke="#3b82f6" strokeWidth="1" fill="none" transform="rotate(30)" />
                <ellipse cx="0" cy="0" rx="24" ry="7.5" stroke="#06b6d4" strokeWidth="1" fill="none" transform="rotate(-30)" />
                <ellipse cx="0" cy="0" rx="24" ry="7.5" stroke="#a855f7" strokeWidth="1" fill="none" transform="rotate(90)" />
                <circle cx="0" cy="0" r="14" fill="#030712" stroke="#3b82f6" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="10" fill="url(#orbGrad)" opacity="0.8" />
                <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle" letterSpacing="0.5">AI</text>
              </g>

              {/* Floating Gold Rupee Coins close to the main graph */}
              <g>
                <g transform="translate(130, 85)" className="animate-rotate-coin">
                  <ellipse cx="0" cy="0" rx="12" ry="4.5" fill="#b45309" opacity="0.6" />
                  <ellipse cx="0" cy="-3.5" rx="12" ry="4.5" fill="url(#coinGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
                  <text x="0" y="-0.5" fill="#ffffff" fontSize="7.5" fontWeight="extrabold" textAnchor="middle">₹</text>
                </g>

                <g transform="translate(75, 110)" className="animate-rotate-coin" style={{ animationDelay: '1.8s' }}>
                  <ellipse cx="0" cy="0" rx="10" ry="3.8" fill="#b45309" opacity="0.6" />
                  <ellipse cx="0" cy="-3" rx="10" ry="3.8" fill="url(#coinGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                  <text x="0" y="-0.5" fill="#ffffff" fontSize="6.5" fontWeight="extrabold" textAnchor="middle">₹</text>
                </g>

                <g transform="translate(175, 130)" className="animate-rotate-coin" style={{ animationDelay: '3.2s' }}>
                  <ellipse cx="0" cy="0" rx="8" ry="3.2" fill="#b45309" opacity="0.6" />
                  <ellipse cx="0" cy="-2.5" rx="8" ry="3.2" fill="url(#coinGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                  <text x="0" y="-0.5" fill="#ffffff" fontSize="5" fontWeight="extrabold" textAnchor="middle">₹</text>
                </g>
              </g>
            </svg>

            {/* Mobile Simplified SVG Illustration (Clean single-column mobile view) */}
            <svg width="240" height="150" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 block sm:hidden mx-auto">
              <defs>
                <linearGradient id="barGradM" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="platformGradM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#0b0f19" />
                </linearGradient>
              </defs>
              <ellipse cx="120" cy="130" rx="65" ry="14" fill="#1e1b4b" opacity="0.3" />
              <ellipse cx="120" cy="126" rx="55" ry="11" fill="url(#platformGradM)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="0.8" />
              
              <g>
                <rect x="80" y="95" width="8" height="25" rx="2" fill="url(#barGradM)" className="animate-rise-up" style={{ animationDelay: '0.0s' }} />
                <rect x="95" y="80" width="8" height="40" rx="2" fill="url(#barGradM)" className="animate-rise-up" style={{ animationDelay: '0.15s' }} />
                <rect x="110" y="60" width="8" height="60" rx="2" fill="url(#barGradM)" className="animate-rise-up" style={{ animationDelay: '0.3s' }} />
                <rect x="125" y="45" width="8" height="75" rx="2" fill="url(#barGradM)" className="animate-rise-up" style={{ animationDelay: '0.45s' }} />
                <rect x="140" y="30" width="8" height="90" rx="2" fill="url(#barGradM)" className="animate-rise-up" style={{ animationDelay: '0.6s' }} />
              </g>

              <path 
                d="M 84 95 Q 115 65 144 30" 
                stroke="#06b6d4" 
                strokeWidth="2.5" 
                fill="none"
                strokeDasharray="150"
                strokeDashoffset="150"
                className="animate-[drawLine_1.8s_ease-out_forwards]"
                style={{ animationDelay: '0.5s' }}
              />
              <circle cx="150" cy="115" r="4" fill="#6366f1" className="animate-pulse" />
            </svg>

            {/* Vertically Stacked Glass Widgets Stack on the far right */}
            <div className="flex flex-col gap-3.5 z-20 hidden sm:flex w-44 md:w-48">
              {/* Widget 1: Total Savings */}
              <div className="bg-[#0b1021]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-lg select-none hover:scale-[1.02] hover:border-indigo-500/30 transition-all duration-300">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Total Savings</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">₹{(stats.income - stats.expense).toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Widget 2: AI Status */}
              <div className="bg-[#0b1021]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-lg select-none hover:scale-[1.02] hover:border-indigo-500/30 transition-all duration-300">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">AI Analysis</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-400">Active</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Staggered Entrance Summary Cards */}
      <motion.div 
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <StatCard
          title="Total Balance"
          value={stats.balance}
          icon={IndianRupee}
          color="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-600/10"
          pillBg="bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
          glowClass="glow-blue"
          delayIndex={0}
        />
        <StatCard
          title="Total Income"
          value={stats.income}
          icon={TrendingUp}
          color="bg-gradient-to-r from-emerald-500 to-green-600 shadow-green-600/10"
          pillBg="bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
          glowClass="glow-green"
          delayIndex={1}
        />
        <StatCard
          title="Total Expenses"
          value={stats.expense}
          icon={TrendingDown}
          color="bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-600/10"
          pillBg="bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
          glowClass="glow-red"
          delayIndex={2}
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions}
          icon={Activity}
          color="bg-gradient-to-r from-purple-500 to-indigo-600 shadow-indigo-600/10"
          pillBg="bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20"
          glowClass="glow-purple"
          delayIndex={3}
        />
        <StatCard
          title="Savings Rate"
          value={Number(stats.savingsRate.toFixed(1))}
          icon={Percent}
          color="bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-600/10"
          pillBg="bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20"
          glowClass="glow-amber"
          delayIndex={4}
        />
      </motion.div>

      {/* Chart Containers (Animated boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ 
            y: -3,
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.3)",
          }}
          className="glass-card rounded-3xl p-6 border border-gray-100 dark:border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
            <div className="flex items-center">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mr-3 border border-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white select-none">
                Monthly Trends
              </h3>
            </div>
            {/* Visual selector dropdown */}
            <div className="relative select-none">
              <select className="appearance-none bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer">
                <option>Last 12 Months</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="w-full h-80">
            <BarChartComponent data={monthlyData} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ 
            y: -3,
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.3)",
          }}
          className="glass-card rounded-3xl p-6 border border-gray-100 dark:border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
            <div className="flex items-center">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl mr-3 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white select-none">
                Daily Income vs Expenses
              </h3>
            </div>
            {/* Visual selector dropdown */}
            <div className="relative select-none">
              <select className="appearance-none bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer">
                <option>Last 30 Days</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="w-full h-80">
            <LineChartComponent data={dailyData} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ 
            y: -3,
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.3)",
          }}
          className="glass-card rounded-3xl p-6 lg:col-span-2 border border-gray-100 dark:border-white/5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
            <div className="flex items-center">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl mr-3 border border-purple-500/20">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white select-none">
                Expense Breakdown
              </h3>
            </div>
            <div className="relative select-none">
              <select className="appearance-none bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer">
                <option>By Category</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="w-full h-80">
            <PieChartComponent data={categoryData} />
          </div>
        </motion.div>
      </div>

      {/* AI Insights & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Redesigned AI Insight Widget with floating SVG robot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ y: -3, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)" }}
          className="glass-card rounded-3xl p-6 border border-gray-100 dark:border-white/5 relative overflow-hidden lg:col-span-1 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-5">
              <div className="flex items-center">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl mr-3 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white select-none">
                  AI Insight
                </h3>
              </div>
              <div className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                Active
              </div>
            </div>

            <h4 className="text-emerald-400 font-extrabold text-sm mb-2">Great job! 🎉</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
              Your savings rate is 18.4% higher than last month. Keep it up!
            </p>
          </div>

          <div className="flex items-end justify-between mt-6">
            <button
              onClick={() => navigate("/ai-insights")}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 px-3.5 py-2 rounded-xl border border-indigo-500/10 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              View All Insights →
            </button>

            {/* Custom Interactive SVG Floating Robot Mascot */}
            <div className="relative pr-2 select-none">
              <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float-wallet">
                <ellipse cx="50" cy="85" rx="30" ry="10" fill="#312e81" opacity="0.6" />
                <ellipse cx="50" cy="81" rx="30" ry="10" fill="#4f46e5" />
                <ellipse cx="50" cy="81" rx="24" ry="7" fill="#06b6d4" opacity="0.5" />
                <rect x="35" y="45" width="30" height="26" rx="8" fill="#e2e8f0" stroke="#4f46e5" strokeWidth="2" />
                <rect x="46" y="40" width="8" height="6" fill="#94a3b8" />
                <rect x="28" y="16" width="44" height="26" rx="10" fill="#f1f5f9" stroke="#4f46e5" strokeWidth="2" />
                <rect x="34" y="22" width="32" height="14" rx="4" fill="#0f172a" />
                <circle cx="44" cy="29" r="3" fill="#06b6d4" className="animate-pulse" />
                <circle cx="56" cy="29" r="3" fill="#06b6d4" className="animate-pulse" />
                <circle cx="28" cy="29" r="1.5" fill="#3b82f6" />
                <circle cx="72" cy="29" r="1.5" fill="#3b82f6" />
                <line x1="50" y1="16" x2="50" y2="8" stroke="#4f46e5" strokeWidth="2" />
                <circle cx="50" cy="6" r="3" fill="#f59e0b" />
                <path d="M35 55 C28 55 24 60 25 65" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
                <path d="M65 55 C72 55 76 60 75 65" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
                <rect x="43" y="52" width="14" height="8" rx="1" fill="#0f172a" />
                <line x1="46" y1="56" x2="54" y2="56" stroke="#22c55e" strokeWidth="0.8" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ y: -3, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)" }}
          className="glass-card rounded-3xl p-6 border border-gray-100 dark:border-white/5 relative overflow-hidden lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
            <div className="flex items-center">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl mr-3 border border-indigo-500/20">
                <List className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white select-none">
                Recent Transactions
              </h3>
            </div>
            <button
              onClick={handleViewAllTransactions}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              View All
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {recentTransactions.map((t, i) => {
                  const isIncome = t.type === "income";
                  return (
                    <motion.div
                      key={t.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ scale: 1.005, backgroundColor: theme === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.04)" }}
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl border border-transparent dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        }`}>
                          {isIncome ? <TrendingUp className="h-5 w-5 animate-pulse" /> : <TrendingDown className="h-5 w-5 animate-pulse" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">
                            {t.category}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center mt-1 select-none">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {new Date(t.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-base font-extrabold ${
                          isIncome ? "text-green-600 dark:text-emerald-500" : "text-red-600 dark:text-rose-500"
                        }`}
                      >
                        {isIncome ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-10 select-none">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-slate-400 font-medium">
                No transactions yet
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                Start by adding your first transaction
              </p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
