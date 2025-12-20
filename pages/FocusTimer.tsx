import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

interface FocusTimerProps {
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ showToast }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Play sound or show alert
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
    
    if (mode === 'focus') {
      showToast("Time for a break! Amazing work.", "success");
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      showToast("Break over. Back to focus!", "info");
      setMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-heading font-black text-slate-900 dark:text-white mb-2">Focus Engine</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Stay productive with the Pomodoro technique</p>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Progress Circle SVG */}
        <svg className="absolute w-full h-full rotate-[-90deg]">
          <circle 
            cx="160" cy="160" r="140" fill="transparent" 
            stroke="currentColor" strokeWidth="8" 
            className="text-slate-100 dark:text-slate-800"
          />
          <circle 
            cx="160" cy="160" r="140" fill="transparent" 
            stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            style={{ 
              strokeDasharray: '880', 
              strokeDashoffset: (880 - (880 * progress) / 100).toString(),
              transition: 'stroke-dashoffset 0.5s ease-in-out'
            }}
            className={mode === 'focus' ? 'text-primary-600' : 'text-emerald-500'}
          />
        </svg>

        <div className="z-10 text-center">
          <div className="flex justify-center mb-2">
            {mode === 'focus' ? <Zap className="text-primary-600" /> : <Coffee className="text-emerald-500" />}
          </div>
          <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
            {mode === 'focus' ? 'Focus Session' : 'Short Break'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-16">
        <button 
          onClick={resetTimer}
          className="p-4 bg-slate-100 text-slate-600 rounded-3xl hover:bg-slate-200 transition-all active:scale-90"
          title="Reset"
        >
          <RotateCcw size={28} />
        </button>

        <button 
          onClick={toggleTimer}
          className={`w-24 h-24 rounded-[40px] flex items-center justify-center text-white shadow-2xl transition-all active:scale-95 ${
            isActive ? 'bg-rose-500 shadow-rose-500/20' : 'bg-primary-600 shadow-primary-500/20'
          }`}
        >
          {isActive ? <Pause size={40} strokeWidth={3} /> : <Play size={40} fill="currentColor" className="ml-2" />}
        </button>

        <div className="w-14"></div> {/* Balance spacer */}
      </div>

      <div className="mt-12 flex gap-4">
        <button 
          onClick={() => { setMode('focus'); setTimeLeft(25*60); setIsActive(false); }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'focus' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}
        >
          Break
        </button>
      </div>
    </div>
  );
};