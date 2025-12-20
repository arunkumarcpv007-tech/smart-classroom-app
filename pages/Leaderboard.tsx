import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User, UserRole } from '../types';
import { Trophy, Star, Medal, Plus, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  currentUser: User | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ showToast, currentUser }) => {
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    const allUsers = StorageService.getUsers();
    const sortedStudents = allUsers
      .filter(u => u.role === UserRole.STUDENT)
      .sort((a, b) => (b.xp || 0) - (a.xp || 0));
    setStudents(sortedStudents);
  }, []);

  const handleGiveXP = (studentId: string) => {
    StorageService.giveXP(studentId, 10);
    const updated = StorageService.getUsers()
      .filter(u => u.role === UserRole.STUDENT)
      .sort((a, b) => (b.xp || 0) - (a.xp || 0));
    setStudents(updated);
    const name = students.find(s => s.id === studentId)?.name;
    showToast(`Awarded 10 XP to ${name}!`, "success");
  };

  const isTeacher = currentUser?.role === UserRole.TEACHER || currentUser?.role === UserRole.ADMIN;

  const topThree = students.slice(0, 3);
  const others = students.slice(3);

  return (
    <div className="space-y-8 animate-fade-in h-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white mb-2">Hall of Fame</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Recognizing our top performers this semester</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto mb-16 px-4">
        {/* Silver - Rank 2 */}
        {topThree[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center">
            <div className="relative mb-4">
              <img src={topThree[1].avatar} className="w-24 h-24 rounded-[32px] border-4 border-slate-300 shadow-xl object-cover" />
              <div className="absolute -top-3 -right-3 bg-slate-300 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><Medal size={24} /></div>
            </div>
            <div className="glass w-full p-6 rounded-t-[40px] text-center border-b-0 border-slate-200">
              <p className="font-black text-slate-900 dark:text-white truncate">{topThree[1].name}</p>
              <p className="text-primary-600 font-black">{topThree[1].xp} XP</p>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rank #2</div>
            </div>
          </div>
        )}

        {/* Gold - Rank 1 */}
        {topThree[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="relative mb-6 scale-110">
              <img src={topThree[0].avatar} className="w-32 h-32 rounded-[40px] border-4 border-yellow-400 shadow-2xl object-cover" />
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl animate-bounce"><Trophy size={28} /></div>
            </div>
            <div className="glass w-full p-8 rounded-t-[48px] text-center border-b-0 border-yellow-200/50 shadow-2xl shadow-yellow-500/10">
              <p className="text-xl font-black text-slate-900 dark:text-white truncate">{topThree[0].name}</p>
              <p className="text-primary-600 text-lg font-black">{topThree[0].xp} XP</p>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-yellow-500">Master of Science</div>
            </div>
          </div>
        )}

        {/* Bronze - Rank 3 */}
        {topThree[2] && (
          <div className="order-3 flex flex-col items-center">
            <div className="relative mb-4">
              <img src={topThree[2].avatar} className="w-24 h-24 rounded-[32px] border-4 border-orange-400 shadow-xl object-cover" />
              <div className="absolute -top-3 -right-3 bg-orange-400 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><Star size={24} /></div>
            </div>
            <div className="glass w-full p-6 rounded-t-[40px] text-center border-b-0 border-slate-200">
              <p className="font-black text-slate-900 dark:text-white truncate">{topThree[2].name}</p>
              <p className="text-primary-600 font-black">{topThree[2].xp} XP</p>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rank #3</div>
            </div>
          </div>
        )}
      </div>

      {/* List of others */}
      <div className="glass max-w-4xl mx-auto rounded-[40px] overflow-hidden border border-slate-200 shadow-xl mb-12">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {others.map((student, idx) => (
            <div key={student.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-6">
                <span className="w-8 text-center font-black text-slate-300">#{idx + 4}</span>
                <img src={student.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{student.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Roll: {student.rollNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-black text-primary-600">{student.xp} XP</p>
                  <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (student.xp || 0) / 10)}%` }}></div>
                  </div>
                </div>
                {isTeacher && (
                  <button 
                    onClick={() => handleGiveXP(student.id)}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm"
                    title="Reward Points"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {others.length === 0 && <div className="p-12 text-center text-slate-400 font-bold italic">Keep studying to reach the top!</div>}
        </div>
      </div>
    </div>
  );
};