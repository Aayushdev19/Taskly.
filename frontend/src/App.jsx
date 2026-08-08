import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth, API_BASE_URL } from './context/AuthContext';
import NavBar from './components/NavBar';
import { Loader2, CheckCircle2, Info, X } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskManager = lazy(() => import('./pages/TaskManager'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Profile = lazy(() => import('./pages/Profile'));

function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[40vh]">
      <div className="relative flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 text-[#ff9777] animate-spin" />
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase animate-pulse">
          Loading page...
        </span>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, token, loading, toast, setToast } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Request browser desktop notification permissions
  useEffect(() => {
    if (token && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [token]);

  // Check task deadlines and display reminders
  useEffect(() => {
    if (!token || !user) return;

    const checkTaskReminders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) return;
        const todos = await response.json();

        const now = new Date();

        todos.forEach((todo) => {
          if (todo.status === 'completed' || !todo.due_date) return;

          const dueDate = new Date(todo.due_date);
          const timeDiffMs = dueDate - now;
          const diffInMinutes = Math.round(timeDiffMs / (1000 * 60));

          // Trigger reminders at 10 and 5 minutes remaining
          if (diffInMinutes === 10 || diffInMinutes === 5) {
            const reminderKey = `taskly-reminded-${todo.id}-${diffInMinutes}`;

            if (!localStorage.getItem(reminderKey)) {
              localStorage.setItem(reminderKey, 'true');
              const message = `Reminder: "${todo.title}" is due in ${diffInMinutes} minutes!`;

              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification("Task Reminder ⏰", {
                    body: message,
                    tag: `reminder-${todo.id}-${diffInMinutes}`,
                    requireInteraction: true,
                  });
                } catch (err) {
                  console.error("Desktop Notification failed, falling back to toast:", err);
                  setToast({ message, type: 'info' });
                }
              } else {
                setToast({ message, type: 'info' });
              }
            }
          }
        });
      } catch (err) {
        console.error("Error checking task reminders:", err);
      }
    };

    checkTaskReminders();
    const interval = setInterval(checkTaskReminders, 60000);

    return () => clearInterval(interval);
  }, [token, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBE9E1] flex flex-col items-center justify-center text-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-[80px]"></div>
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#ff9777] animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Initializing Taskly...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBE9E1] flex flex-col relative">
      {toast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-[9999] glass-panel px-4 py-3 rounded-2xl shadow-lg border border-slate-200/50 flex items-center gap-3 bg-white/95 backdrop-blur-md sm:max-w-sm animate-float">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Info className="h-4.5 w-4.5" />}
          </div>
          <div className="text-left font-semibold text-[11px] text-slate-700 pr-1">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(null)} 
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!token || !user ? (
        <Suspense fallback={<PageLoader />}>
          {authView === 'register' ? (
            <Register onNavigateToLogin={() => setAuthView('login')} />
          ) : (
            <Login onNavigateToRegister={() => setAuthView('register')} />
          )}
        </Suspense>
      ) : user.role === 'admin' ? (
        <div className="min-h-screen bg-[#EBE9E1] flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <AdminPanel />
          </Suspense>
          <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/40 mt-auto">
            <p>© {new Date().getFullYear()} Taskly Inc. All rights reserved. Admin Console.</p>
          </footer>
        </div>
      ) : (
        <>
          <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 max-w-7xl w-full mx-auto pb-24 md:pb-12 overflow-x-hidden">
            <Suspense fallback={<PageLoader />}>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'tasks' && <TaskManager />}
              {activeTab === 'profile' && <Profile />}
            </Suspense>
          </main>
          <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/40 mt-auto">
            <p>© {new Date().getFullYear()} Taskly Inc. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
