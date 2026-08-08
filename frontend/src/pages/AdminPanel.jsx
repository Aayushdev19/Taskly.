import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShieldAlert,
  Users,
  FolderKanban,
  CheckSquare,
  Calendar,
  LogOut,
} from "lucide-react";

export default function AdminPanel() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!statsRes.ok) throw new Error("Failed to load metrics");
      const statsData = await statsRes.json();

      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!usersRes.ok) throw new Error("Failed to load user records");
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-200 shimmer"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-200 shimmer"></div>
          <div className="h-64 rounded-2xl bg-slate-200 shimmer"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <div className="glass-panel p-8 rounded-3xl inline-block max-w-md bg-white">
          <ShieldAlert className="h-10 w-10 text-[#ff9777] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Access Denied
          </h2>
          <p className="text-slate-500 text-xs mb-5">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              fetchAdminData();
            }}
            className="px-4 py-2 bg-[#ff9777] hover:bg-[#e68262] text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const CATEGORY_COLORS = {
    Work: "#ff9777",
    Personal: "#f59e0b",
    Health: "#10b981",
    Finance: "#8b5cf6",
    Other: "#64748b",
  };

  return (
    <div className="min-h-screen bg-[#EBE9E1] flex flex-col w-full animate-fade-in-up">
      {/* Self-contained Admin Header */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm border-b border-slate-200/50 backdrop-blur-md rounded-b-2xl bg-white/75">
        <div className="flex items-center gap-1.5">
          <span className="font-black tracking-tight bg-gradient-to-r from-[#ff9777] to-amber-500 bg-clip-text text-transparent text-xl font-sans select-none">
            Taskly.
          </span>
          <span className="text-xs font-semibold text-slate-500 ml-1.5 border-l border-slate-300 pl-2">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/60 bg-white/80 shadow-sm">
            <div className="h-7 w-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#ff9777]">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
            <div className="text-left leading-none">
              <span className="block text-[10px] font-bold text-slate-700 max-w-[120px] truncate">
                {user?.email}
              </span>
              <span className="inline-block text-[8px] uppercase tracking-widest font-extrabold mt-0.5 text-violet-650">
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors shadow-sm"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* Main Admin Dashboard Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </span>
              <span className="block text-2xl font-extrabold text-slate-900 mt-1">
                {stats.totalUsers}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#ff9777]">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Todos
              </span>
              <span className="block text-2xl font-extrabold text-slate-900 mt-1">
                {stats.totalTodos}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#ff9777]">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm bg-white/95 border-slate-200/40">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Completion Rate
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stats.completionRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  ({stats.completedTodos} done)
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl shadow-sm bg-white/95 border-slate-200/40 flex flex-col justify-between">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#ff9777]" />
              <h3 className="text-sm font-bold text-slate-800">
                User Signup Trends
              </h3>
            </div>

            {stats.registrationTrends.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                No new signups registered
              </div>
            ) : (
              <div className="h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.registrationTrends}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e4e2d9"
                    />
                    <XAxis
                      dataKey="date"
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
                    <Bar
                      dataKey="count"
                      name="Signups"
                      fill="#ff9777"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl shadow-sm bg-white/95 border-slate-200/40 flex flex-col justify-between">
            <div className="mb-3 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[#ff9777]" />
              <h3 className="text-sm font-bold text-slate-800">
                Global Category Split
              </h3>
            </div>

            {stats.categoryDistribution.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                No tasks split
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 mt-2">
                <div className="h-36 w-36 relative flex items-center justify-center shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stats.categoryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CATEGORY_COLORS[entry.name] ||
                              CATEGORY_COLORS.Other
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
                      Total
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      {stats.totalTodos}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {stats.categoryDistribution.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-650"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[item.name] || CATEGORY_COLORS.Other,
                        }}
                      ></span>
                      <span>
                        {item.name}:{" "}
                        <span className="text-slate-800 font-bold">
                          {item.value}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl shadow-sm overflow-hidden bg-white border-slate-200/40">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 text-left">
            <h3 className="text-sm font-bold text-slate-800">
              Users Portfolio
            </h3>
          </div>

          {/* Desktop User Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 uppercase tracking-wider font-bold bg-slate-50/30 text-[10px]">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Account Type</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-center">Total Tasks</th>
                  <th className="p-4 text-center">Completed</th>
                  <th className="p-4 text-right pr-6">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {users.map((u) => {
                  const userRate =
                    u.total_todos > 0
                      ? Math.round((u.completed_todos / u.total_todos) * 100)
                      : 0;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="p-4 pl-6 text-slate-400 font-mono">
                        #{u.id}
                      </td>
                      <td className="p-4 text-slate-800 font-semibold">
                        {u.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                            u.role === "admin"
                              ? "bg-red-50 border-red-100 text-[#ff9777]"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-455">
                        {new Date(u.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-750">
                        {u.total_todos}
                      </td>
                      <td className="p-4 text-center font-bold text-emerald-600">
                        {u.completed_todos}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-800">
                            {userRate}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-100 inline-block overflow-hidden">
                            <div
                              className="bg-[#ff9777] h-full rounded-full"
                              style={{ width: `${userRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile User Cards */}
          <div className="md:hidden divide-y divide-slate-100 p-5 space-y-5">
            {users.map((u) => {
              const userRate =
                u.total_todos > 0
                  ? Math.round((u.completed_todos / u.total_todos) * 100)
                  : 0;

              return (
                <div key={u.id} className="pt-5 first:pt-0 pb-5 last:pb-0 space-y-3 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-slate-800 break-all text-xs">
                      {u.email}
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border shrink-0 ${
                        u.role === "admin"
                          ? "bg-red-50 border-red-100 text-[#ff9777]"
                          : "bg-emerald-50 border-emerald-100 text-emerald-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold tracking-wider">
                    Joined: {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/30 text-xs">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px] mb-0.5">
                        Total Tasks
                      </span>
                      <span className="font-extrabold text-slate-800">{u.total_todos}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px] mb-0.5">
                        Completed
                      </span>
                      <span className="font-extrabold text-emerald-600">{u.completed_todos}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-black tracking-wider text-slate-450 uppercase">
                      <span>Completion Rate</span>
                      <span className="text-slate-800 font-bold">{userRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-250/10">
                      <div
                        className="bg-[#ff9777] h-full rounded-full"
                        style={{ width: `${userRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-right text-[8px] font-mono text-slate-400">
                    ID: #{u.id}
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
