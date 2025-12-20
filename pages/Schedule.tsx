
import React from 'react';
// Added Calendar to the imports from lucide-react
import { Clock, MapPin, Calendar } from 'lucide-react';

export const Schedule: React.FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const today = new Date().getDay(); // 1-5 for Mon-Fri
  
  const timetable = [
    { time: '08:00 AM', subjects: ['Maths', 'English', 'Science', 'Maths', 'History'] },
    { time: '10:00 AM', subjects: ['Science', 'History', 'Maths', 'Science', 'English'] },
    { time: '12:00 PM', subjects: ['Lunch Break', 'Lunch Break', 'Lunch Break', 'Lunch Break', 'Lunch Break'] },
    { time: '01:00 PM', subjects: ['English', 'Lab', 'Art', 'English', 'P.E.'] },
    { time: '03:00 PM', subjects: ['Self Study', 'Library', 'Sports', 'Lab', 'Club'] },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-900 dark:text-white mb-2">Smart Schedule</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Weekly Academic Timetable</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-primary-100 text-primary-600 px-4 py-2 rounded-xl text-sm font-black border border-primary-200">
             Term 1 - 2024
           </div>
        </div>
      </div>

      <div className="glass rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
          <div className="p-6 font-black text-xs uppercase text-slate-400">Time</div>
          {days.map((day, idx) => (
            <div key={day} className={`p-6 font-black text-xs uppercase text-center relative ${today === idx + 1 ? 'text-primary-600' : 'text-slate-400'}`}>
              {day}
              {today === idx + 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-full"></div>
              )}
            </div>
          ))}
        </div>

        {timetable.map((slot, idx) => (
          <div key={idx} className="grid grid-cols-6 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
            <div className="p-6 flex items-center gap-3 font-bold text-slate-500 text-sm">
              <Clock size={16} className="text-slate-300" />
              {slot.time}
            </div>
            {slot.subjects.map((sub, sIdx) => {
              const isToday = today === sIdx + 1;
              const isBreak = sub === 'Lunch Break';
              
              return (
                <div key={sIdx} className={`p-4 border-l border-slate-50 dark:border-slate-800 text-center flex flex-col items-center justify-center transition-all ${isToday ? 'bg-primary-50/20' : ''}`}>
                  <div className={`w-full p-4 rounded-2xl transition-all ${
                    isBreak 
                    ? 'bg-slate-100 text-slate-400 italic text-xs' 
                    : isToday 
                    ? 'bg-white dark:bg-slate-800 shadow-lg shadow-primary-500/10 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 font-black'
                    : 'bg-white/50 text-slate-600 font-bold'
                  }`}>
                    {sub}
                    {!isBreak && (
                       <div className="flex items-center justify-center gap-1 text-[8px] mt-1 text-slate-400 font-bold">
                         <MapPin size={8} /> Room 302
                       </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-8 rounded-[32px] bg-gradient-to-br from-primary-600 to-accent text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
             <Calendar size={32} />
           </div>
           <div>
             <h4 className="text-xl font-black">Next Holiday</h4>
             <p className="opacity-80 font-bold">Winter Break starts in 14 days</p>
           </div>
        </div>
        <button className="bg-white text-primary-600 px-6 py-3 rounded-2xl font-black hover:scale-105 transition-transform active:scale-95 shadow-xl">
          View Holiday List
        </button>
      </div>
    </div>
  );
};
