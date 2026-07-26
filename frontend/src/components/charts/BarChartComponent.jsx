import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BarChartComponent = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.name,
    Income: item.income,
    Expense: item.expense,
  }));

  const isDark = document.documentElement.classList.contains("dark");
  const strokeColor = isDark ? "rgba(255, 255, 255, 0.05)" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const axisColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: -10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: textColor, fontWeight: 500 }}
          axisLine={{ stroke: axisColor }}
          tickLine={{ stroke: axisColor }}
        />
        <YAxis
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: textColor, fontWeight: 500 }}
          axisLine={{ stroke: axisColor }}
          tickLine={{ stroke: axisColor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            borderRadius: 12,
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            color: isDark ? "#fff" : "#000",
            fontSize: 12,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value, name) => [
            `₹${value.toLocaleString("en-IN")}`,
            name,
          ]}
        />
        <Legend 
          wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
          formatter={(value) => <span style={{ color: textColor, fontWeight: 500 }}>{value}</span>}
        />
        <Bar
          dataKey="Income"
          fill="url(#incomeGradient)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          isAnimationActive={true}
          animationDuration={1000}
        />
        <Bar
          dataKey="Expense"
          fill="url(#expenseGradient)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          isAnimationActive={true}
          animationDuration={1000}
        />
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#e11d48" stopOpacity={0.9} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
