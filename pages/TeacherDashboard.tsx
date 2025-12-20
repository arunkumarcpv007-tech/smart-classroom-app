import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User, AttendanceRecord, Assignment, UserRole, Note } from '../types';
import { 
  Users, UserCheck, FilePlus, Calendar, Search, 
  MessageSquare, Play, Check, X, ArrowRight,
  TrendingUp, Star, Award, ShieldAlert, BookOpen, Trash2, Send
} from 'lucide-react';

interface TeacherDashboardProps {
  currentSection: string;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentSection, showToast }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Local state for Attendance Manager
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [attendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Local state for Assignment Creator
  const [newAssignment, setNewAssignment] = useState({ title: '', dueDate: '', description: '' });

  // Local state for Note Creator
  const [newNote, setNewNote] = useState({ title: '', subject: 'Mathematics', content: '' });

  // Local state for Student Search
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allUsers = StorageService.getUsers();
    const studentList = allUsers.filter(u => u.role === UserRole.STUDENT);
    setStudents(studentList);
    setAssignments(StorageService.getAssignments());
    setAttendanceRecords(StorageService.getAttendance());
    setNotes(StorageService.getNotes());

    // Initialize local attendance state based on existing records for today
    const existing = StorageService.getAttendance().filter(r => r.date === attendanceDate);
    const initialMap: Record<string, 'present' | 'absent'> = {};
    studentList.forEach(s => {
      const rec = existing.find(r => r.studentId === s.id);
      initialMap[s.id] = rec ? (rec.status as 'present' | 'absent') : 'absent';
    });
    setLocalAttendance(initialMap);
  }, [attendanceDate, currentSection]);

  const handlePostAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.dueDate) {
      showToast("Please fill in required fields", "error");
      return;
    }
    const assignment: Assignment = {
      id: 'a' + Date.now(),
      ...newAssignment,
      classId: 'c1',
      status: 'pending'
    };
    StorageService.addAssignment(assignment);
    setAssignments(StorageService.getAssignments());
    setNewAssignment({ title: '', dueDate: '', description: '' });
    showToast(`Assignment "${assignment.title}" Published!`, "success");
  };

  const handleGrade = (id: string) => {
    StorageService.updateAssignment(id, { status: 'graded' });
    setAssignments(StorageService.getAssignments());
    showToast("Assignment Graded!", "success");
  };

  const saveAttendance = () => {
    (Object.entries(localAttendance) as [string, 'present' | 'absent'][]).forEach(([studentId, status]) => {
      StorageService.saveAttendance({
        id: Math.random().toString(36).substr(2, 9),
        date: attendanceDate,
        classId: 'c1',
        studentId,
        status
      });
    });
    setAttendanceRecords(StorageService.getAttendance());
    showToast("Attendance Saved Successfully", "success");
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      showToast("Title and content are required", "error");
      return;
    }
    const note: Note = {
      id: 'n' + Date.now(),
      ...newNote,
      uploadedBy: StorageService.getCurrentUser()?.id || '',
      classId: 'c1',
      date: new Date().toISOString().split('T')[0]
    };
    StorageService.addNote(note);
    setNotes(StorageService.getNotes());
    setNewNote({ title: '', subject: 'Mathematics', content: '' });
    showToast(`Study material "${note.title}" uploaded!`, "success");
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Delete this material?")) {
      StorageService.deleteNote(id);
      setNotes(StorageService.getNotes());
      showToast("Material removed", "info");
    }
  };

  const getPerformanceBadge = (xp: number = 0) => {
    if (xp > 900) return { label: 'Elite', color: 'bg-indigo-500', icon: Award };
    if (xp > 700) return { label: 'Pro', color: 'bg-orange-500', icon: Star };
    return { label: 'Rising', color: 'bg-slate-400', icon: TrendingUp };
  };

  const presentPercentage = students.length > 0 
    ? Math.round(((Object.values(localAttendance) as ('present' | 'absent')[]).filter(v => v === 'present').length / students.length) * 100)
    : 0;

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      
      {/* 📊 SECTION: TEACHER HOME (#teacher-home) */}
      {currentSection === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">Command Center</h1>
              <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-1">Classroom Oversight & Insights</p>
            </div>
            <button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3">
              <Play size={20} fill="currentColor" /> Start Class Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={Users} label="Total Students" value={students.length} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard icon={UserCheck} label="Today's Presence" value={`${presentPercentage}%`} color="text-orange-600" bg="bg-orange-50" />
            <StatCard icon={FilePlus} label="Active Assignments" value={assignments.length} color="text-violet-600" bg="bg-violet-50" />
          </div>
        </div>
      )}

      {/* ✅ SECTION: ATTENDANCE MANAGER (#teacher-attendance) */}
      {currentSection === 'attendance' && (
        <div className="space-y-8">
          <div className="flex justify-between items-end">
             <div>
               <h2 className="text-3xl font-black">Attendance Vault</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Session: {attendanceDate}</p>
             </div>
             <button onClick={saveAttendance} className="bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
               <Check size={20} /> Save Roll Call
             </button>
          </div>

          <div className="glass rounded-[48px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
             <table className="w-full text-left">
               <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 <tr>
                   <th className="px-10 py-6">Student Info</th>
                   <th className="px-10 py-6">Roll No</th>
                   <th className="px-10 py-6 text-right">Presence Toggle</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {students.map(s => (
                   <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-10 py-6 flex items-center gap-4">
                       <img src={s.avatar} className="w-10 h-10 rounded-2xl object-cover" />
                       <span className="font-black text-slate-900 dark:text-white">{s.name}</span>
                     </td>
                     <td className="px-10 py-6 font-bold text-slate-400">#0{s.rollNo}</td>
                     <td className="px-10 py-6 text-right">
                       <div className="flex justify-end">
                         <button 
                           onClick={() => setLocalAttendance(p => ({...p, [s.id]: p[s.id] === 'present' ? 'absent' : 'present'}))}
                           className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${
                             localAttendance[s.id] === 'present' 
                             ? 'bg-emerald-100 text-emerald-700' 
                             : 'bg-rose-100 text-rose-700'
                           }`}
                         >
                           {localAttendance[s.id] === 'present' ? <Check size={14} /> : <X size={14} />}
                           {localAttendance[s.id]}
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* 📝 SECTION: ASSIGNMENT CREATOR (#teacher-assignments) */}
      {currentSection === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-3xl font-black">Post New Homework</h2>
            <form onSubmit={handlePostAssignment} className="glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Title</label>
                <input 
                  type="text" value={newAssignment.title} onChange={e => setNewAssignment(p => ({...p, title: e.target.value}))}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="e.g. Calculus Midterm Prep" required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Due Date</label>
                <input 
                  type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment(p => ({...p, dueDate: e.target.value}))}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Description</label>
                <textarea 
                   value={newAssignment.description} onChange={e => setNewAssignment(p => ({...p, description: e.target.value}))}
                   className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold h-32"
                   placeholder="Instructions for students..."
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                Publish to Students
              </button>
            </form>
          </div>

          <div className="space-y-8">
             <h3 className="text-xl font-black text-slate-400">Recently Posted</h3>
             <div className="space-y-4">
               {assignments.slice().reverse().map(a => (
                 <div key={a.id} className="glass p-6 rounded-[32px] border border-slate-100 flex justify-between items-center group">
                   <div>
                     <h4 className="font-black text-slate-800 dark:text-white">{a.title}</h4>
                     <div className="flex gap-3 items-center mt-1">
                       <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Due: {a.dueDate}</p>
                       <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                         a.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                         a.status === 'submitted' ? 'bg-blue-100 text-blue-600' : 
                         'bg-emerald-100 text-emerald-600'
                       }`}>
                         {a.status}
                       </span>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     {a.status === 'submitted' && (
                       <button 
                         onClick={() => handleGrade(a.id)}
                         className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg active:scale-90"
                         title="Mark as Graded"
                       >
                         <Check size={20} />
                       </button>
                     )}
                     <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                       <ArrowRight size={20} />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* 📚 SECTION: STUDY MATERIALS (#teacher-notes) */}
      {currentSection === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-3xl font-black">Upload Material</h2>
            <form onSubmit={handlePostNote} className="glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Title</label>
                <input 
                  type="text" value={newNote.title} onChange={e => setNewNote(p => ({...p, title: e.target.value}))}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="e.g. Chapter 1: Introduction" required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Subject</label>
                <select 
                  value={newNote.subject} onChange={e => setNewNote(p => ({...p, subject: e.target.value}))}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-black uppercase text-xs tracking-widest"
                >
                  {['Mathematics', 'Science', 'English', 'History', 'Physics', 'Coding'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Summary/Content</label>
                <textarea 
                   value={newNote.content} onChange={e => setNewNote(p => ({...p, content: e.target.value}))}
                   className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold h-32"
                   placeholder="Short summary of the material..."
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Send size={18} /> Upload Material
              </button>
            </form>
          </div>

          <div className="space-y-8">
             <h3 className="text-xl font-black text-slate-400">Manage Vault</h3>
             <div className="space-y-4">
               {notes.slice().reverse().map(n => (
                 <div key={n.id} className="glass p-6 rounded-[32px] border border-slate-100 flex justify-between items-center group">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                       <BookOpen size={20} />
                     </div>
                     <div>
                       <h4 className="font-black text-slate-800 dark:text-white">{n.title}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.subject} • {n.date}</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => handleDeleteNote(n.id)}
                     className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                   >
                     <Trash2 size={20} />
                   </button>
                 </div>
               ))}
               {notes.length === 0 && <p className="text-center py-12 text-slate-300 italic font-bold">The vault is currently empty.</p>}
             </div>
          </div>
        </div>
      )}

      {/* 👥 SECTION: STUDENT DIRECTORY (#teacher-students) */}
      {currentSection === 'users' && (
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <h2 className="text-3xl font-black">Class Roster</h2>
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="Find student by name or roll..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-3xl glass border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => {
               const badge = getPerformanceBadge(s.xp);
               return (
                 <div key={s.id} className="glass p-8 rounded-[48px] border border-slate-200 dark:border-slate-800 text-center group hover:border-indigo-500 transition-all hover:-translate-y-2">
                   <div className="relative inline-block mb-6">
                      <img src={s.avatar} className="w-24 h-24 rounded-[40px] border-4 border-white dark:border-slate-800 object-cover shadow-2xl" />
                      <div className={`absolute -bottom-2 -right-2 ${badge.color} text-white p-2 rounded-2xl shadow-xl`}>
                         <badge.icon size={16} />
                      </div>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{s.name}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Roll No: {s.rollNo}</p>
                   
                   <div className="flex justify-center gap-4">
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl hover:text-indigo-600 transition-colors">
                        <MessageSquare size={18} />
                      </button>
                      <button className="flex-1 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        Profile
                      </button>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 flex items-center gap-8 hover:shadow-2xl transition-all">
    <div className={`${bg} ${color} w-20 h-20 rounded-[32px] flex items-center justify-center shadow-inner`}>
      <Icon size={32} />
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-4xl font-black text-slate-900 dark:text-white">{value}</h4>
    </div>
  </div>
);