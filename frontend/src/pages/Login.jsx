import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Wallet,
  Brain,
  Shield,
  TrendingUp,
  Lock,
} from "lucide-react";

const Login = () => {
  const { user, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b13] text-slate-100 flex flex-col md:flex-row relative overflow-hidden bg-grid-pattern">
      {/* Background radial glow spotlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-float1" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none animate-float3" />
      <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-emerald-600/5 blur-[100px] pointer-events-none animate-float2" />

      {/* Left Column: Brand Showcase (Desktop/Tablet) */}
      <div className="hidden md:flex w-1/2 flex-col justify-between py-12 pl-12 pr-6 lg:pl-16 lg:pr-8 xl:pl-24 xl:pr-12 relative z-10 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            FinPilot AI
          </span>
        </div>

        {/* Brand Value Prop */}
        <div className="my-auto py-8">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Take control of your <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
              financial future.
            </span>
          </h1>
          <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-8 max-w-lg">
            Track expenses, understand spending patterns, manage budgets, and
            receive intelligent financial insights from one secure dashboard.
          </p>

          {/* Feature List */}
          <div className="space-y-5 max-w-md">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-1 border border-indigo-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm lg:text-base">
                  Smart expense tracking
                </h4>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                  Categorize and monitor your spending automatically in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-1 border border-cyan-500/20">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm lg:text-base">
                  AI-powered financial insights
                </h4>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                  Receive personalized optimization insights to save more each month.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1 border border-emerald-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 text-sm lg:text-base">
                  Secure and private data
                </h4>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                  Your details are protected with bank-grade encryption protocols.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Preview Widgets Area (Only visible on larger desktop screens to avoid clutter) */}
          <div className="relative h-64 w-full mt-10 lg:block hidden">
            {/* Grid backdrop element */}
            <div className="absolute inset-0 bg-[#0f172a]/30 rounded-2xl border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            </div>

            {/* Floating Balance Widget */}
            <div className="absolute top-4 left-4 glass-card p-4 rounded-xl border border-white/15 shadow-lg w-60 transform -rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">Total Balance</span>
                <span className="flex items-center text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +18.4%
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">₹1,24,500.00</div>
              <div className="mt-3 flex justify-between items-center text-[9px] text-slate-500 border-t border-white/5 pt-2 font-medium">
                <span>FinPilot Premium Card</span>
                <span>•• 4892</span>
              </div>
            </div>

            {/* Floating Chart Widget */}
            <div className="absolute bottom-4 right-4 glass-card p-4 rounded-xl border border-white/15 shadow-lg w-60 transform rotate-2 hover:rotate-0 transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">Spending Pattern</span>
                <span className="text-[9px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  AI Analyzed
                </span>
              </div>
              {/* Mini SVG Chart */}
              <div className="h-16 flex items-end justify-between gap-2 px-1">
                <div className="w-full bg-slate-800/50 rounded-t h-[40%] relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="w-full bg-slate-800/50 rounded-t h-[75%] relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="w-full bg-slate-800/50 rounded-t h-[55%] relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="w-full bg-slate-800/50 rounded-t h-[90%] relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="w-full bg-slate-800/50 rounded-t h-[65%] relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[8px] text-slate-500 font-semibold px-0.5 uppercase tracking-wider">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
              </div>
            </div>

            {/* Floating AI Insight Widget */}
            <div className="absolute -bottom-4 left-6 glass-card p-3 rounded-xl border border-indigo-500/20 shadow-xl max-w-[260px] transform -rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-[11px] font-semibold text-slate-200">Smart Savings Insight</h5>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">
                    AI identified ₹3,400 excess recurring subscription fees. Keep track!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info for branding column */}
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} FinPilot AI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Interface (Desktop/Tablet/Mobile) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center py-12 px-6 sm:px-10 md:py-12 md:pr-12 md:pl-6 lg:pr-16 lg:pl-8 xl:pr-24 xl:pl-12 relative z-10 min-h-screen">
        {/* Mobile branding header (Only visible when smaller than md breakpoint) */}
        <div className="md:hidden flex flex-col items-center text-center mb-8 select-none">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 mb-3 animate-float1">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            FinPilot AI
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Smarter financial decisions, powered by AI.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden drop-animation">
          {/* Accent lighting glow behind card header */}
          <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="text-center md:text-left mb-8 relative z-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome to FinPilot AI
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Sign in to access your financial dashboard.
            </p>
          </div>

          {/* Action button */}
          <div className="space-y-4 relative z-10">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-3 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#070b13] disabled:opacity-50 disabled:cursor-not-allowed group min-h-[48px]"
              aria-label="Sign in with Google"
            >
              {loading ? (
                <div
                  className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"
                  aria-hidden="true"
                ></div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-slate-800">Sign in with Google</span>
                </>
              )}
            </button>

            {/* Google secure indicator */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1 font-medium">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span>Secure sign-in powered by Google</span>
            </div>
          </div>

          {/* Footer details */}
          <div className="border-t border-white/5 mt-8 pt-6 relative z-10">
            <p className="text-center text-[11px] text-slate-500 leading-relaxed font-medium font-sans">
              By continuing, you agree to our{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-0.5"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-0.5"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Small mobile-only bottom attribution */}
        <div className="md:hidden mt-8 text-[11px] text-slate-600 select-none font-medium">
          © {new Date().getFullYear()} FinPilot AI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
