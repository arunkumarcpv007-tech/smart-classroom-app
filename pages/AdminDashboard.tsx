import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User, UserRole } from '../types';
import { 
  Users, Shield, Activity, BarChart3, Megaphone, Settings, 
  Trash2, Plus, X, Mail, ShieldCheck, GraduationCap, UserCheck, 
  Search, AlertTriangle, Send, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  currentSection: string;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentSection, showToast }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [activeUserTab, setActiveUserTab] = useState<'teachers' | 'students'>('teachers');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.STUDENT, rollNo: '' });
  const [announcement, setAnnouncement] = useState(localStorage.getItem('scms_global_alert') || '');

  useEffect(() => {
    setUsers(StorageService.getUsers());
  }, [currentSection]);

  const handleDeleteUser = (id: string) => {
    if (confirm("Permanently revoke system access for this user?")) {
      StorageService.deleteUser(id);
      setUsers(StorageService.getUsers());
      showToast("Access Revoked", "info");
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return showToast("Required data missing", "error");
    const userToAdd: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    };
    StorageService.addUser(userToAdd);
    setUsers(StorageService.getUsers());
    setShowAddModal(false);
    showToast(`Registered: ${userToAdd.name}`, "success");
    setNewUser({ name: '', email: '', role: UserRole.STUDENT, rollNo: '' });
  };

  const handleBroadcast = () => {
    localStorage.setItem('scms_global_alert', announcement);
    // Trigger a window event so App.tsx can catch it if needed, or just toast
    window.dispatchEvent(new Event('storage'));
    showToast("Announcement Broadcasted", "success");
  };

  const clearBroadcast = () => {
    localStorage.removeItem('scms_global_alert');
    setAnnouncement('');
    window.dispatchEvent(new Event('storage'));
    showToast("Broadcast Cleared", "info");
  };

  const stats = {
    students: users.filter(u => u.role === UserRole.STUDENT).length,
    teachers: users.filter(u => u.role === UserRole.TEACHER).length,
    total: users.length
  };

  const trendData = [
    { day: 'Mon', attendance: 85 },
    { day: 'Tue', attendance: 92 },
    { day: 'Wed', attendance: 88 },
    { day: 'Thu', attendance: 95 },
    { day: 'Fri', attendance: 90 },
  ];

  const filteredUsers = users.filter(u => {
    const roleMatch = activeUserTab === 'teachers' ? u.role === UserRole.TEACHER : u.role === UserRole.STUDENT;
    const searchMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      
      {/* 📈 SECTION: SYSTEM OVERVIEW (#admin-home) */}
      {currentSection === 'dashboard' && (
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">System Command</h1>
              <p className="text-primary-600 font-bold uppercase tracking-widest text-xs mt-1">Institutional Overview & Health</p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <Activity className="text-emerald-500 animate-pulse" size={20} />
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">System Health: Optimal</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={Users} label="Total Managed Users" value={stats.total} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard icon={GraduationCap} label="Total Classes" value="12" color="text-blue-600" bg="bg-blue-50" />
            <StatCard icon={UserCheck} label="Active Sessions" value="28" color="text-emerald-600" bg="bg-emerald-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <BarChart3 className="text-primary-600" /> Attendance Trends (Weekly)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} unit="%" />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                    />
                    <Bar dataKey="attendance" radius={[10, 10, 0, 0]} barSize={40}>
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.attendance > 90 ? '#3b82f6' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                   <ShieldCheck className="text-emerald-500" /> Security Status
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  All systems are operating under encrypted protocols. Daily backups completed at 04:00 AM UTC.
                </p>
              </div>
              <div className="space-y-4 mt-8">
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                   <span className="text-xs font-black uppercase text-slate-400">Database</span>
                   <span className="text-xs font-black text-emerald-500">SYNCED</span>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                   <span className="text-xs font-black uppercase text-slate-400">Firewall</span>
                   <span className="text-xs font-black text-emerald-500">ACTIVE</span>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm active:scale-95 transition-all">
                Run Security Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👥 SECTION: MANAGE USERS (#admin-users) */}
      {currentSection === 'users' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-3xl font-black">User Registry</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={20} /> Register New User
              </button>
            </div>
          </div>

          <div className="glass rounded-[48px] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
                 <button 
                   onClick={() => setActiveUserTab('teachers')}
                   className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeUserTab === 'teachers' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   Teachers
                 </button>
                 <button 
                   onClick={() => setActiveUserTab('students')}
                   className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeUserTab === 'students' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   Students
                 </button>
               </div>
               <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-10 py-6">Identification</th>
                    <th className="px-10 py-6">Credentials</th>
                    <th className="px-10 py-6 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-slate-100" />
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <p className="text-sm font-bold text-slate-600">{u.email}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Roll: {u.rollNo || 'ADMIN'}</p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                          title="Revoke Access"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-20 text-center text-slate-400 font-bold italic">No records found matching criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 📢 SECTION: BROADCAST ALERT (#admin-broadcast) */}
      {currentSection === 'announcements' && (
        <div className="max-w-4xl space-y-8">
           <div className="flex items-center gap-4">
              <Megaphone className="text-primary-600" size={32} />
              <h2 className="text-3xl font-black">Global Broadcast</h2>
           </div>

           <div className="glass p-10 rounded-[48px] border border-slate-200 space-y-8">
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                 <AlertTriangle className="text-amber-600 mt-1 shrink-0" />
                 <p className="text-sm text-amber-800 font-medium">
                   Announcements broadcasted here will appear as a primary banner on all student and teacher dashboards until cleared. Use for critical updates only.
                 </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Message Payload</label>
                <textarea 
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                  className="w-full h-48 p-8 rounded-[32px] bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg"
                  placeholder="Type institutional announcement here..."
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleBroadcast}
                  className="flex-1 bg-primary-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Send size={20} /> Deploy Broadcast
                </button>
                <button 
                  onClick={clearBroadcast}
                  className="px-10 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-sm hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                >
                  Clear All Alerts
                </button>
              </div>
           </div>
        </div>
      )}

      {/* ⚙️ SECTION: SETTINGS (#admin-settings) */}
      {currentSection === 'settings' && (
        <div className="max-w-4xl space-y-8">
           <h2 className="text-3xl font-black">Institutional Config</h2>
           
           <div className="grid gap-6">
             <SettingsOption icon={RefreshCw} title="System Cache Reset" desc="Purge temporary session data without affecting core database records." />
             <SettingsOption icon={Activity} title="Maintenance Mode" desc="Take the student portal offline for scheduled infrastructure upgrades." danger />
           </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl animate-fade-in-up">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black">Register Identity</h3>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddUser} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Legal Name</label>
                <input 
                  type="text" required value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Sarah Connor"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">System Email</label>
                <input 
                  type="email" required value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="sarah@command.edu"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Assigned Role</label>
                  <select 
                    value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value as UserRole}))}
                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 font-black border-none outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value={UserRole.TEACHER}>TEACHER</option>
                    <option value={UserRole.STUDENT}>STUDENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Roll / ID</label>
                  <input 
                    type="text" value={newUser.rollNo} onChange={e => setNewUser(p => ({...p, rollNo: e.target.value}))}
                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="ID-101"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-[32px] shadow-2xl active:scale-95 transition-all mt-4">
                Finalize Registration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="glass p-10 rounded-[48px] border border-slate-200 flex items-center gap-8 hover:shadow-2xl transition-all">
    <div className={`${bg} ${color} w-20 h-20 rounded-[32px] flex items-center justify-center shadow-inner`}>
      <Icon size={32} />
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-4xl font-black text-slate-900 dark:text-white">{value}</h4>
    </div>
  </div>
);

const SettingsOption = ({ icon: Icon, title, desc, danger }: any) => (
  <div className="glass p-8 rounded-[40px] border border-slate-200 flex items-center justify-between group hover:border-slate-400 transition-all">
    <div className="flex items-center gap-6">
       <div className={`p-4 rounded-2xl ${danger ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
         <Icon size={24} />
       </div>
       <div>
         <h4 className="font-black text-lg">{title}</h4>
         <p className="text-slate-500 text-sm font-medium">{desc}</p>
       </div>
    </div>
    <button className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${danger ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-900 text-white hover:bg-black'}`}>
      Execute
    </button>
  </div>
);
