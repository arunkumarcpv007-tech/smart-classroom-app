import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { Save, User as UserIcon, Mail, Shield, Camera, X, Upload, Check, Palette } from 'lucide-react';

interface ProfileProps {
  onUserUpdate: (user: User) => void;
}

const THEME_COLORS = [
  { id: 'blue', label: 'Royal Blue', hex: '#2563eb' },
  { id: 'purple', label: 'Deep Violet', hex: '#8b5cf6' },
  { id: 'emerald', label: 'Emerald Green', hex: '#10b981' }
];

export const Profile: React.FC<ProfileProps> = ({ onUserUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [message, setMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name);
      setAvatar(currentUser.avatar || '');
      setSelectedTheme(currentUser.themeColor || 'blue');
      applyTheme(currentUser.themeColor || 'blue');
    }
  }, []);

  const applyTheme = (colorId: string) => {
    const colorObj = THEME_COLORS.find(c => c.id === colorId) || THEME_COLORS[0];
    document.documentElement.style.setProperty('--primary-600', colorObj.hex);
    // Update tailwind dynamic primary if possible, but standard CSS var is more reliable for raw injection
    document.body.style.setProperty('--primary-accent', colorObj.hex);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = { ...user, name, avatar, themeColor: selectedTheme };
    StorageService.updateUser(updatedUser);
    onUserUpdate(updatedUser);
    applyTheme(selectedTheme);
    setMessage('Profile and Theme Saved!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage safety
        setMessage('File too large (Max 1MB)');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (err) {
      setIsCameraOpen(false);
      setMessage("Camera access denied.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setAvatar(canvas.toDataURL('image/jpeg', 0.8));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };

  if (!user) return <div className="p-20 text-center animate-pulse">Initializing Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-primary-600 font-bold uppercase tracking-widest text-xs mt-1">Personalize your identity and theme</p>
        </div>
      </div>
      
      <div className="glass rounded-[48px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="h-40 bg-gradient-to-r from-primary-600 to-indigo-700"></div>
        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-20 mb-10">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[48px] border-8 border-white dark:border-slate-900 bg-white overflow-hidden shadow-2xl">
                <img 
                  src={avatar || `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`} 
                  alt="Profile" className="w-full h-full object-cover"
                />
              </div>
              <button 
                type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-4 rounded-3xl cursor-pointer hover:bg-primary-600 transition-all shadow-xl z-10"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-3xl glass border border-slate-100 focus:ring-2 focus:ring-primary-600 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Role</label>
                <div className="relative">
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text" value={user.role} disabled
                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800 text-slate-400 cursor-not-allowed font-black uppercase tracking-tighter"
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  <Palette size={14} /> UI Accent Theme
                </label>
                <div className="flex gap-6">
                  {THEME_COLORS.map(c => (
                    <button
                      key={c.id} type="button" onClick={() => { setSelectedTheme(c.id); applyTheme(c.id); }}
                      className={`group relative flex flex-col items-center gap-2 transition-all ${selectedTheme === c.id ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <div className="w-16 h-16 rounded-[24px] border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center transition-all" style={{ backgroundColor: c.hex }}>
                         {selectedTheme === c.id && <Check className="text-white" size={24} />}
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-500">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-3xl font-black shadow-2xl active:scale-95 transition-all"
              >
                <Save size={20} />
                Save Preferences
              </button>
              
              <div className="flex items-center gap-4">
                <button type="button" onClick={startCamera} className="text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">Capture via Webcam</button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </div>

              {message && <span className="text-primary-600 font-black animate-bounce flex items-center gap-2 text-sm">{message}</span>}
            </div>
          </form>
        </div>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden max-w-lg w-full relative shadow-2xl">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white">Identity Capture</h3>
                <button onClick={stopCamera} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
             </div>
             <div className="relative bg-black aspect-square w-full">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
             </div>
             <div className="p-10 flex justify-center">
                 <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-8 border-primary-600 bg-white shadow-2xl transition-transform active:scale-90 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-full"></div>
                 </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};