import React from 'react';
import { User } from '../types';
import { Printer, ShieldCheck, QrCode, Mail, Globe } from 'lucide-react';

interface IDCardProps {
  user: User | null;
}

export const IDCard: React.FC<IDCardProps> = ({ user }) => {
  if (!user) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Digital Identity</h1>
          <p className="text-primary-600 font-bold uppercase tracking-widest text-xs mt-1">Verified Institutional Credentials</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black shadow-2xl active:scale-95 transition-all flex items-center gap-3"
        >
          <Printer size={20} /> Print Identification
        </button>
      </div>

      <div className="flex justify-center py-10">
        <div id="id-card-printable" className="relative w-full max-w-sm aspect-[1.586/1] rounded-[32px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white group border border-slate-100">
          {/* Design Elements */}
          <div className="absolute top-0 right-0 w-[45%] h-full bg-primary-600 -skew-x-12 translate-x-16 transition-all duration-700 group-hover:bg-indigo-600"></div>
          
          <div className="relative h-full flex flex-col p-8 z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-auto">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-none">SCMS</h2>
                <p className="text-[10px] font-black uppercase text-primary-600 tracking-widest mt-1">PREMIUM ACADEMY</p>
              </div>
              <ShieldCheck className="text-white" size={32} />
            </div>

            {/* Body */}
            <div className="flex gap-6 items-center">
              <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-50">
                 <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                    className="w-full h-full object-cover" 
                    alt="ID Portrait" 
                  />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 truncate">{user.name}</h3>
                <p className="text-primary-600 font-bold text-xs uppercase tracking-wider">{user.role}</p>
                <div className="mt-4 space-y-1">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                     <span className="uppercase">ROLL NO:</span>
                     <span className="text-slate-900 font-black">{user.rollNo || 'ADMIN-00'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                     <span className="uppercase">VALID THRU:</span>
                     <span className="text-slate-900 font-black">DEC 2025</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-4">
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400">
                    <Mail size={8} /> {user.email}
                 </div>
                 <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400">
                    <Globe size={8} /> WWW.SCMS.EDU
                 </div>
               </div>
               <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                  <QrCode size={40} className="text-slate-900" />
               </div>
            </div>
          </div>
          
          {/* Card Back Hologram Effect (Visual Only) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto glass p-8 rounded-[32px] border border-slate-200 text-center">
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
           This Digital ID Card is a secure representation of your student/teacher status. Use the print feature for physical authentication during on-campus events or library checkouts.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #id-card-printable, #id-card-printable * { visibility: visible; }
          #id-card-printable { 
            position: fixed; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%) scale(1.5);
            box-shadow: none;
            border: 1px solid #e2e8f0;
          }
        }
      `}} />
    </div>
  );
};