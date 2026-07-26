import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LineChartComponent = ({ data }) => {
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
      <LineChart
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
        <Line
          type="monotone"
          dataKey="Income"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: "#10b981", strokeWidth: 1.5, r: 3.5 }}
          activeDot={{ r: 5.5, stroke: "#10b981", strokeWidth: 1.5 }}
          isAnimationActive={true}
          animationDuration={1000}
        />
        <Line
          type="monotone"
          dataKey="Expense"
          stroke="#f43f5e"
          strokeWidth={3}
          dot={{ fill: "#f43f5e", strokeWidth: 1.5, r: 3.5 }}
          activeDot={{ r: 5.5, stroke: "#f43f5e", strokeWidth: 1.5 }}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
