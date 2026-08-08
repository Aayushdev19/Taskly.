import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../context/AuthContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Award,
  Clock,
  AlertTriangle,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + ' • ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/suggestions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard metrics");
      }

      const resData = await response.json();
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded-xl shimmer"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-200 shimmer"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200 shimmer"></div>
          <div className="h-80 rounded-2xl bg-slate-200 shimmer"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <div className="glass-panel p-8 rounded-3xl inline-block max-w-md bg-white">
          <AlertTriangle className="h-10 w-10 text-[#ff9777] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Failed to Load Dashboard
          </h2>
          <p className="text-slate-500 text-xs mb-5">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              fetchDashboardData();
            }}
            className="px-4 py-2 bg-[#ff9777] hover:bg-[#e68262] text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { metrics, charts, recommendations } = data;

  const CATEGORY_COLORS = {
    Work: "#ff9777",
    Personal: "#f59e0b",
    Health: "#10b981",
    Finance: "#8b5cf6",
    Other: "#64748b",
  };

  const PRIORITY_COLORS = {
    High: "#ff9777",
    Medium: "#3b82f6",
    Low: "#10b981",
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "warning":
        return {
          border: "border-amber-200",
          bg: "bg-amber-50/60",
          text: "text-amber-800",
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        };
      case "success":
        return {
          border: "border-emerald-200",
          bg: "bg-emerald-50/60",
          text: "text-emerald-800",
          icon: <Award className="h-4 w-4 text-emerald-600" />,
        };
      case "info":
      default:
        return {
          border: "border-red-150",
          bg: "bg-red-50/50",
          text: "text-red-900",
          icon: <Sparkles className="h-4 w-4 text-[#ff9777]" />,
        };
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-xs">
            Overview of your task analytics and suggestions.
          </p>
        </div>
        <div className="md:hidden self-start sm:self-center text-[10px] font-bold text-slate-500 bg-white/50 border border-slate-200/40 px-3.5 py-2 rounded-xl shadow-xs">
          {formatTime(currentTime)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40 card-hover">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <span className="block text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.total}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#ff9777]">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40 card-hover">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {metrics.completionRate}%
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {metrics.completed}/{metrics.total}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40 card-hover">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Overdue Tasks
            </span>
            <span
              className={`block text-2xl font-extrabold mt-1 ${metrics.overdue > 0 ? "text-rose-600" : "text-slate-900"}`}
            >
              {metrics.overdue}
            </span>
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              metrics.overdue > 0
                ? "bg-rose border border-rose-100 text-rose-600"
                : "bg-slate-100 border border-slate-200/60 text-slate-400"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40 card-hover">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Avg Completion Time
            </span>
            <span className="block text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.avgCompletionTimeHours}{" "}
              <span className="text-xs font-semibold text-slate-400">hrs</span>
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm bg-white/95 border-slate-200/40 flex flex-col justify-between card-hover">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Completion History (Last 7 Days)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={charts.completionHistory}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9777" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ff9777" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e2d9"
                />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#0f172a",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Completed"
                  stroke="#ff9777"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHistory)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-sm bg-white/95 border-slate-200/40 flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Category Distribution
            </h3>
          </div>

          {charts.categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <span className="text-xs">No tasks recorded</span>
            </div>
          ) : (
            <div className="h-48 relative flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#0f172a",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">
                  Done
                </span>
                <span className="text-lg font-black text-slate-800">
                  {metrics.completed}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100 pt-3">
            {charts.categoryData.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[item.name] || CATEGORY_COLORS.Other,
                  }}
                ></span>
                <span className="truncate">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl shadow-sm bg-white/95 border-slate-200/40 flex flex-col justify-between card-hover">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Priority Breakdown
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.priorityData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e2d9"
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.01)" }}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#0f172a",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar dataKey="value" name="Count" radius={[5, 5, 0, 0]}>
                  {charts.priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.name] || "#ff9777"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm bg-white/95 border-slate-200/40 flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Productivity Insights
            </h3>
          </div>

          <div className="flex-1 space-y-3 mt-4 overflow-y-auto max-h-56 pr-1">
            {recommendations.map((item) => {
              const styles = getSeverityStyle(item.severity);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border ${styles.border} ${styles.bg} flex items-start gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs`}
                >
                  <div className="shrink-0 mt-0.5">{styles.icon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
