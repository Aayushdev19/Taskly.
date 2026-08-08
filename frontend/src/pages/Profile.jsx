import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "../context/AuthContext";
import { User, Mail, Camera, Save, ShieldAlert, Loader2 } from "lucide-react";

export default function Profile() {
  const { user, setUser, token, setToast } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatar }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 text-xs">
          Manage your personal account credentials and profile photo.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="glass-panel p-6 rounded-3xl shadow-sm bg-white/95 border-slate-200/40 space-y-6 text-left"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-slate-350" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 h-8.5 w-8.5 rounded-full bg-[#ff9777] hover:bg-[#e68262] text-white flex items-center justify-center cursor-pointer shadow-md transition-colors border-2 border-white">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {name || "Your Name"}
            </h3>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-50 border border-emerald-100 text-emerald-600">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-xs transition-all focus:ring-1 bg-slate-50/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-xs bg-slate-100/50 text-slate-400 cursor-not-allowed"
                value={user.email}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Account Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-xs bg-slate-100/50 text-slate-400 cursor-not-allowed uppercase font-bold tracking-wider"
                value={user.role}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff9777] to-amber-500 hover:from-[#e68262] hover:to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
