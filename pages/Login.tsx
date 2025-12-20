import React, { useState } from 'react';
import { UserRole } from '../types';
import { StorageService } from '../services/storage';
import { GraduationCap, Mail, ArrowRight, ShieldCheck, UserCheck, School } from 'lucide-react';

export const Login: React.FC<{onLoginSuccess: () => void}> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('student@scms.com');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = StorageService.login(email, role);
    if (user) onLoginSuccess();
    else setError('No account found for this role with this email.');
  };

  const setDemo = (r: UserRole) => {
    setRole(r);
    if (r === UserRole.ADMIN) setEmail('admin@scms.com');
    if (r === UserRole.TEACHER) setEmail('teacher@scms.com');
    if (r === UserRole.STUDENT) setEmail('student@scms.com');
    setError('');
  };

  const roles = [
    { id: UserRole.STUDENT, icon: GraduationCap, label: 'Student' },
    { id: UserRole.TEACHER, icon: UserCheck, label: 'Teacher' },
    { id: UserRole.ADMIN, icon: ShieldCheck, label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 blur-[120px] rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-float"></div>
      </div>

      <div className="glass w-full max-w-md p-8 sm:p-12 rounded-[40px] shadow-2xl z-10 animate-fade-in-up border border-white/40 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-600 rounded-3xl shadow-xl shadow-primary-500/30 flex items-center justify-center mx-auto mb-6 rotate-3">
             <School className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">SCMS Premium</h2>
          <p className="text-slate-500 font-medium mt-2">The future of classroom management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Your Role</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setDemo(r.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${
                    role === r.id 
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-primary-200'
                  }`}
                >
                  <r.icon size={22} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none font-medium transition-all"
                  placeholder="name@school.edu" required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse-soft">{error}</p>}

          <button type="submit" className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-extrabold py-5 rounded-3xl shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group">
            Unlock Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-400 font-medium">
            New here? <a href="#" className="text-primary-600 font-bold hover:underline">Contact System Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
};