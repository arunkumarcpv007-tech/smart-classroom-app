import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Task, User, Assignment, Note } from '../types';
import { 
  FileText, Clock, CheckCircle, Plus, X, 
  BookOpen, Calendar, ArrowRight, Download,
  TrendingUp, UserCheck, Trash2, GraduationCap,
  Search, Filter, Calculator as CalcIcon, RefreshCw
} from 'lucide-react';

interface StudentDashboardProps {
  currentSection: string; 
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface GradeRow {
  id: string;
  subject: string;
  credit: number;
  grade: number; 
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentSection, showToast }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Search & Filter State
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');

  // Local state for modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '' });

  // CGPA Calculator State
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([
    { id: '1', subject: 'Mathematics', credit: 3, grade: 4.0 },
    { id: '2', subject: 'Physics', credit: 4, grade: 3.7 },
  ]);
  const [cgpaResult, setCgpaResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setCurrentUser(StorageService.getCurrentUser());
    setTasks(StorageService.getTasks());
    setAssignments(StorageService.getAssignments());
    setNotes(StorageService.getNotes());
  }, [currentSection]);

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    StorageService.updateTask(id, { completed: !task.completed });
    setTasks(StorageService.getTasks());
    showToast(task.completed ? "Task uncompleted" : "Task completed!", "success");
  };

  const submitAssignment = (id: string) => {
    StorageService.updateAssignment(id, { status: 'submitted' });
    setAssignments(StorageService.getAssignments());
    showToast("Assignment Submitted!", "success");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: 'Student Mission',
      dueDate: newTask.dueDate,
      classId: 'PERSONAL',
      completed: false,
      assignedTo: currentUser?.id || 'STUDENT'
    };
    StorageService.addTask(task);
    setTasks(StorageService.getTasks());
    setShowTaskModal(false);
    setNewTask({ title: '', dueDate: '' });
    showToast("Mission Accepted!", "success");
  };

  // Calculator Logic
  const addGradeRow = () => {
    setGradeRows([...gradeRows, { id: Date.now().toString(), subject: '', credit: 0, grade: 0 }]);
  };

  const removeGradeRow = (id: string) => {
    setGradeRows(gradeRows.filter(r => r.id !== id));
  };

  const updateGradeRow = (id: string, field: keyof GradeRow, value: any) => {
    setGradeRows(gradeRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const calculateCGPA = () => {
    setIsCalculating(true);
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    gradeRows.forEach(row => {
      const c = Number(row.credit);
      const g = Number(row.grade);
      if (!isNaN(c) && !isNaN(g)) {
        totalCredits += c;
        totalGradePoints += c * g;
      }
    });

    setTimeout(() => {
      setIsCalculating(false);
      if (totalCredits === 0) {
        showToast("Invalid calculation: Total credits cannot be zero.", "error");
        setCgpaResult(null);
        return;
      }
      const result = totalGradePoints / totalCredits;
      setCgpaResult(result);
      showToast(`Calculation successful: ${result.toFixed(2)}`, "success");
    }, 600);
  };

  const resetCalculator = () => {
    setGradeRows([{ id: Date.now().toString(), subject: '', credit: 0, grade: 0 }]);
    setCgpaResult(null);
    showToast("Calculator reset", "info");
  };

  // Note Filtering Logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(noteSearch.toLowerCase()) || 
                          note.content.toLowerCase().includes(noteSearch.toLowerCase()) ||
                          note.subject.toLowerCase().includes(noteSearch.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  }).sort((a, b) => {
    if (sortByDate === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const subjects = ['All', ...new Set(notes.map(n => n.subject))];

  const getSectionClass = (sectionId: string) => {
    return currentSection === sectionId ? 'app-section active' : 'hidden';
  };

  return (
    <div className="min-h-full pb-20">
      
      {/* 🏠 SECTION 1: STUDENT HOME */}
      <section id="student-home" className={getSectionClass('dashboard')}>
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Academic Pulse</h1>
          <p className="text-primary-600 font-bold mt-2 uppercase tracking-widest text-xs">Real-time performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlassStatCard icon={UserCheck} label="Attendance" value="94%" sub="24/26 Sessions" color="text-emerald-500" bg="bg-emerald-500/10" />
          <GlassStatCard icon={Clock} label="Pending Tasks" value={tasks.filter(t => !t.completed).length} sub="Due this week" color="text-orange-500" bg="bg-orange-500/10" />
          <GlassStatCard icon={TrendingUp} label="Current Rank" value="#04" sub="Top 5% of Class" color="text-primary-600" bg="bg-primary-500/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-[40px] border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black mb-8">Recent Activity</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
              <ActivityItem icon={CheckCircle} title="Mathematics Quiz Completed" time="2 hours ago" status="Grade: A+" color="text-emerald-500" />
              <ActivityItem icon={FileText} title="New Notes Uploaded: Science" time="5 hours ago" status="Chapter 4: Energy" color="text-primary-600" />
              <ActivityItem icon={Calendar} title="Holiday Announcement" time="Yesterday" status="Winter Break Approaching" color="text-purple-500" />
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Today's Focus</h3>
              <button onClick={() => setShowTaskModal(true)} className="p-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 active:scale-90 transition-transform">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-primary-600 transition-colors">
                  <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}>
                    <CheckCircle size={14} />
                  </button>
                  <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🔢 SECTION: CGPA CALCULATOR */}
      <section id="student-calculator" className={getSectionClass('calculator')}>
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black">GPA Analytics</h2>
            <p className="text-primary-600 font-bold mt-1 uppercase tracking-widest text-[10px]">Strategic Grade Planning</p>
          </div>
          <button 
            onClick={resetCalculator}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
          >
            <RefreshCw size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 space-y-8 shadow-2xl">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 hide-scrollbar">
              {gradeRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-4 items-center animate-fade-in group">
                  <div className="col-span-5">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block">Course Name</label>
                    <input 
                      type="text" placeholder="e.g. Algorithms" value={row.subject} 
                      onChange={(e) => updateGradeRow(row.id, 'subject', e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-primary-600 font-bold text-sm transition-all"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block">Credits</label>
                    <input 
                      type="number" placeholder="Hrs" value={row.credit} 
                      onChange={(e) => updateGradeRow(row.id, 'credit', e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-primary-600 font-bold text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block">Grade (GPA)</label>
                    <input 
                      type="number" step="0.1" max="4.0" placeholder="0.0 - 4.0" value={row.grade} 
                      onChange={(e) => updateGradeRow(row.id, 'grade', e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-2 focus:ring-primary-600 font-bold text-sm"
                    />
                  </div>
                  <div className="col-span-1 text-right pt-4">
                    <button onClick={() => removeGradeRow(row.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
              <button onClick={addGradeRow} className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                <Plus size={16} /> Add New Course
              </button>
              <button 
                onClick={calculateCGPA} 
                disabled={isCalculating}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3"
              >
                {isCalculating ? <RefreshCw className="animate-spin" size={16} /> : <CalcIcon size={16} />}
                {isCalculating ? 'Computing...' : 'Calculate CGPA'}
              </button>
            </div>
          </div>

          <div className="glass p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 text-center space-y-8 shadow-2xl relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary-600/10 transition-colors"></div>
            
            <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/30 rounded-[38px] flex items-center justify-center text-primary-600 mx-auto shadow-inner">
               <GraduationCap size={48} />
            </div>
            
            <div>
              <h3 className="text-2xl font-black">Final Projection</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Weighted Average</p>
            </div>

            <div className="relative inline-block">
               <div className={`text-7xl font-black transition-all duration-700 ${cgpaResult ? 'scale-110 text-primary-600' : 'text-slate-200 animate-pulse'}`}>
                {cgpaResult ? cgpaResult.toFixed(2) : '0.00'}
              </div>
              {cgpaResult && (
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg animate-bounce">
                  ESTIMATED
                </div>
              )}
            </div>
            
            <div className="space-y-2">
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-1000 ease-out" 
                    style={{ width: `${(cgpaResult || 0) * 25}%` }}
                  ></div>
               </div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Academic Achievement Progress</p>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
              "Your grades are the footprint of your curiosity. Keep aiming for the peak."
            </p>
          </div>
        </div>
      </section>

      {/* 📝 SECTION 3: NOTES (#student-notes) */}
      <section id="student-notes" className={getSectionClass('notes')}>
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black">Study Vault</h2>
            <p className="text-primary-600 font-bold mt-1 uppercase tracking-widest text-[10px]">Digital library & resources</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search notes..." 
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="pl-12 pr-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-600 outline-none text-sm font-bold w-64 shadow-sm"
                />
             </div>

             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-600"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>

             <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Calendar size={16} className="text-slate-400" />
                <select 
                  value={sortByDate}
                  onChange={(e) => setSortByDate(e.target.value as any)}
                  className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-600"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id} className="glass p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 group hover:border-primary-600 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-2xl text-primary-600">
                  <BookOpen size={24} />
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {note.subject}
                </span>
              </div>
              <h4 className="text-xl font-black mb-2 text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{note.title}</h4>
              <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{note.content}</p>
              
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  <Calendar size={12} /> {note.date}
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  Download <Download size={14} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredNotes.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-[40px] border-dashed border-2 border-slate-200 text-slate-400 font-bold italic">
               No notes found matching your criteria. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </section>

      {/* 📅 SECTION 4: ATTENDANCE */}
      <section id="student-attendance" className={getSectionClass('attendance')}>
        <div className="mb-10">
          <h2 className="text-3xl font-black">Presence History</h2>
          <p className="text-primary-600 font-bold mt-1 uppercase tracking-widest text-[10px]">Institutional Log</p>
        </div>
        <div className="glass rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-50 bg-white/50"><h4 className="font-black text-lg">Current Term</h4></div>
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <tr><th className="px-8 py-5">Date</th><th className="px-8 py-5">Session</th><th className="px-8 py-5 text-right">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[12, 11, 10, 9, 8].map(day => (
                <tr key={day} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-500">Dec {day}, 2024</td>
                  <td className="px-8 py-6 font-black text-slate-900 dark:text-white">Morning Lecture</td>
                  <td className="px-8 py-6 text-right"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${day === 9 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{day === 9 ? 'Absent' : 'Present'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: ADD TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl animate-fade-in-up">
             <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-bold">New Mission</h3><button onClick={() => setShowTaskModal(false)}><X size={20}/></button></div>
             <form onSubmit={handleAddTask} className="p-8 space-y-6">
               <input type="text" required value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:ring-2 focus:ring-primary-600" placeholder="Task goal..." />
               <input type="date" required value={newTask.dueDate} onChange={e => setNewTask(p => ({...p, dueDate: e.target.value}))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none focus:ring-2 focus:ring-primary-600" />
               <button type="submit" className="w-full py-5 bg-primary-600 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">Accept Mission</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GlassStatCard = ({ icon: Icon, label, value, sub, color, bg }: any) => (
  <div className="glass p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 flex items-center gap-6 hover:shadow-xl transition-all">
    <div className={`${bg} ${color} w-16 h-16 rounded-2xl flex items-center justify-center`}><Icon size={28} /></div>
    <div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h4>
      <p className="text-[10px] font-bold text-slate-500 opacity-60 mt-1">{sub}</p>
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, title, time, status, color }: any) => (
  <div className="flex items-start gap-4 relative z-10">
    <div className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 flex items-center justify-center ${color}`}><Icon size={14} /></div>
    <div className="flex-1">
      <div className="flex justify-between items-start"><h4 className="text-sm font-black text-slate-800 dark:text-white">{title}</h4><span className="text-[10px] font-bold text-slate-400">{time}</span></div>
      <p className="text-xs font-bold text-slate-500 mt-1">{status}</p>
    </div>
  </div>
);