import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Notification, User } from './types';
import { StorageService, initStorage } from './services/storage';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { Profile } from './pages/Profile';
import { Whiteboard } from './pages/Whiteboard';
import { IDCard } from './pages/IDCard';
import { Leaderboard } from './pages/Leaderboard';
import { FocusTimer } from './pages/FocusTimer';
import { Schedule } from './pages/Schedule';
import { 
  Menu, Bell, Sun, Moon, Sparkles, Send, X, Home, UserCircle, Settings, LogOut, Check, Megaphone, Mic, MicOff
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const THEME_COLORS_MAP: Record<string, string> = {
  blue: '#2563eb',
  purple: '#8b5cf6',
  emerald: '#10b981'
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(StorageService.getTheme() === 'dark');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(StorageService.getNotifications());
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'info' | 'error'}[]>([]);
  const [globalAlert, setGlobalAlert] = useState<string | null>(localStorage.getItem('scms_global_alert'));

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [aiChatHistory, setAIChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm your Smart Classroom Assistant. Ask me anything about your courses, assignments, or schedule." }
  ]);
  const [aiInput, setAIInput] = useState('');
  const [isAISending, setIsAISending] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initStorage();
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('dashboard');
      const themeColor = user.themeColor || 'blue';
      document.documentElement.style.setProperty('--primary-600', THEME_COLORS_MAP[themeColor]);
    }
    
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const checkAlert = () => setGlobalAlert(localStorage.getItem('scms_global_alert'));
    window.addEventListener('storage', checkAlert);

    // Voice Recognition Initialization
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', checkAlert);
    };
  }, [darkMode]);

  const handleVoiceCommand = (cmd: string) => {
    addToast(`AI Heard: "${cmd}"`, "info");
    
    if (cmd.includes('dashboard') || cmd.includes('home')) setCurrentPage('dashboard');
    else if (cmd.includes('assignment')) setCurrentPage('assignments');
    else if (cmd.includes('vault') || cmd.includes('notes')) setCurrentPage('notes');
    else if (cmd.includes('whiteboard')) setCurrentPage('whiteboard');
    else if (cmd.includes('leaderboard')) setCurrentPage('leaderboard');
    else if (cmd.includes('id card')) setCurrentPage('idcard');
    else if (cmd.includes('dark') || cmd.includes('lights off')) toggleTheme(true);
    else if (cmd.includes('light') || cmd.includes('lights on')) toggleTheme(false);
  };

  const toggleVoiceAssistant = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        addToast("Voice API not supported in this browser.", "error");
        return;
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const toggleTheme = (forcedMode?: boolean) => {
    const newMode = forcedMode !== undefined ? forcedMode : !darkMode;
    setDarkMode(newMode);
    StorageService.setTheme(newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleLoginSuccess = () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setView('dashboard');
    setCurrentPage('dashboard');
    if (user?.themeColor) {
      document.documentElement.style.setProperty('--primary-600', THEME_COLORS_MAP[user.themeColor]);
    }
    addToast(`Welcome back, ${user?.name}!`, "success");
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setView('landing');
    setCurrentPage('dashboard');
    setShowProfileMenu(false);
    addToast("Logged out successfully", "info");
  };

  const handleAISend = async () => {
    if (!aiInput.trim() || isAISending) return;
    const userText = aiInput;
    setAIInput('');
    const newHistory = [...aiChatHistory, { role: 'user' as const, text: userText }];
    setAIChatHistory(newHistory);
    setIsAISending(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: newHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        config: { systemInstruction: 'You are a helpful AI study assistant for SCMS.' },
      });
      setAIChatHistory(prev => [...prev, { role: 'model', text: response.text || "No response." }]);
    } catch (error) {
      addToast("AI error.", "error");
    } finally { setIsAISending(false); }
  };

  const renderSections = () => {
    if (!currentUser) return null;
    if (currentPage === 'leaderboard') return <Leaderboard showToast={addToast} currentUser={currentUser} />;
    if (currentPage === 'timer') return <FocusTimer showToast={addToast} />;
    if (currentPage === 'schedule') return <Schedule />;
    if (currentPage === 'profile') return <Profile onUserUpdate={setCurrentUser} />;
    if (currentPage === 'whiteboard') return <Whiteboard />;
    if (currentPage === 'idcard') return <IDCard user={currentUser} />;

    switch (currentUser.role) {
      case UserRole.ADMIN: return <AdminDashboard currentSection={currentPage} showToast={addToast} />;
      case UserRole.TEACHER: return <TeacherDashboard currentSection={currentPage} showToast={addToast} />;
      case UserRole.STUDENT: return <StudentDashboard currentSection={currentPage} showToast={addToast} />;
      default: return <div>Access Denied</div>;
    }
  };

  if (view === 'landing') return <Landing onLoginClick={() => setView('login')} />;
  if (view === 'login') return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Sidebar 
        role={currentUser?.role || UserRole.STUDENT}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {globalAlert && (
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between z-50 transition-colors duration-500 print:hidden">
            <div className="flex items-center gap-3 overflow-hidden">
              <Megaphone size={18} className="shrink-0 animate-bounce" />
              <div className="whitespace-nowrap animate-marquee font-black text-xs uppercase tracking-widest">{globalAlert}</div>
            </div>
          </div>
        )}

        <header className="glass h-16 flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-transform"><Menu size={20} /></button>
            <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white capitalize truncate">{currentPage.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => toggleTheme()} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            
            <div className="relative ml-2" ref={profileMenuRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group active:scale-95">
                <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=6366f1&color=fff`} alt="Profile" className="w-9 h-9 rounded-xl bg-primary-100 object-cover border border-slate-200 shadow-sm transition-all duration-300" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up z-50">
                  <div className="p-4 border-b bg-white/50 dark:bg-slate-900/50 text-xs">
                    <p className="font-bold">{currentUser?.name}</p>
                    <p className="text-slate-500">{currentUser?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setCurrentPage('profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"><UserCircle size={18} /> Profile Settings</button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl hover:bg-red-50 text-red-600"><LogOut size={18} /> Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">{renderSections()}</div>
        </main>
      </div>

      {/* Futuristic Floating Controls */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 print:hidden">
        {/* Voice Assistant Mic */}
        <button 
          onClick={toggleVoiceAssistant} 
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 group relative ${
            isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white dark:bg-slate-900 text-slate-600'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} className="group-hover:text-primary-600" />}
          {isListening && <div className="absolute inset-0 rounded-full border-4 border-rose-500 animate-ping opacity-20"></div>}
        </button>

        {/* AI Chat Bot */}
        <button onClick={() => setShowAIChat(true)} className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-float">
          <Sparkles size={24} />
        </button>
        
        {showAIChat && (
          <div className="absolute bottom-32 right-0 w-80 h-[400px] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            <div className="bg-primary-600 p-4 text-white flex justify-between items-center"><span className="font-bold">Study AI</span><button onClick={() => setShowAIChat(false)}><X size={18} /></button></div>
            <div className="flex-1 p-4 overflow-y-auto text-sm space-y-4 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50">
              {aiChatHistory.map((chat, idx) => (<div key={idx} className={`p-3 rounded-2xl shadow-sm border ${chat.role === 'user' ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 ml-4' : 'bg-white dark:bg-slate-800 border-slate-100 mr-4'}`}>{chat.text}</div>))}
              {isAISending && <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border animate-pulse">Thinking...</div>}
            </div>
            <div className="p-4 border-t flex gap-2 bg-white dark:bg-slate-900">
              <input type="text" value={aiInput} onChange={(e) => setAIInput(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm outline-none" onKeyPress={(e) => e.key === 'Enter' && handleAISend()} />
              <button onClick={handleAISend} className="p-2 bg-primary-600 text-white rounded-xl active:scale-90"><Send size={18} /></button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none print:hidden">
        {toasts.map(t => (<div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in-up ${t.type === 'success' ? 'bg-secondary-500 text-white' : 'bg-slate-900 text-white'}`}><Check size={14} /><span>{t.message}</span></div>))}
      </div>
    </div>
  );
};

export default App;