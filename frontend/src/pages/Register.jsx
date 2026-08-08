import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Loader2, UserPlus, User } from "lucide-react";

export default function Register({ onNavigateToLogin }) {
  const { register, error: authError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !name) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    setLocalError("");
    setLoading(true);

    try {
      await register(email, password, name);
    } catch (err) {
      setLocalError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#EBE9E1] w-full">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#ff9777]/5 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-[#ff9777] to-amber-600 bg-clip-text text-transparent font-sans select-none">
            Taskly.
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Productivity & Analytics Platform
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-xl bg-white/85 border border-slate-200/50">
          <h2 className="text-lg font-bold text-slate-800 mb-5">
            Create Account
          </h2>

          {(error || authError) && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs">
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label
                className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-xs transition-all focus:ring-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-xs transition-all focus:ring-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-xs transition-all focus:ring-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Verify password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-xs transition-all focus:ring-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff9777] to-amber-500 hover:from-[#e68262] hover:to-amber-600 text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-98 shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Register <UserPlus className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <span className="text-slate-500 font-medium">
              Already have an account?{" "}
            </span>
            <button
              onClick={onNavigateToLogin}
              className="text-[#ff9777] font-bold hover:text-[#e68262] hover:underline transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
