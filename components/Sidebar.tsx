import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, CheckSquare, FilePlus, 
  LogOut, X, GraduationCap, Users, Trophy, Timer, Calendar,
  BarChart3, Megaphone, Settings, FileText, BookOpen, Calculator,
  Edit3, Contact
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose, onLogout, currentPage, onNavigate }) => {
  const getMenuItems = () => {
    const common = [
      { id: 'whiteboard', label: 'Whiteboard', icon: Edit3 },
    ];

    if (role === UserRole.ADMIN) {
      return [
        { id: 'dashboard', label: 'System Overview', icon: BarChart3 },
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        ...common,
        { id: 'settings', label: 'System Settings', icon: Settings },
      ];
    }
    
    if (role === UserRole.TEACHER) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Take Attendance', icon: CheckSquare },
        { id: 'assignments', label: 'Create Assignment', icon: FilePlus },
        { id: 'notes', label: 'Study Vault', icon: BookOpen },
        { id: 'users', label: 'Student Directory', icon: Users },
        ...common,
        { id: 'profile', label: 'Account Settings', icon: Settings },
      ];
    }

    if (role === UserRole.STUDENT) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'timer', label: 'Focus Timer', icon: Timer },
        { id: 'calculator', label: 'CGPA Calculator', icon: Calculator },
        { id: 'idcard', label: 'Digital ID Card', icon: Contact },
        ...common,
        { id: 'attendance', label: 'Attendance', icon: CheckSquare },
        { id: 'assignments', label: 'Assignments', icon: FileText },
        { id: 'notes', label: 'Study Vault', icon: BookOpen },
        { id: 'profile', label: 'Account Settings', icon: Settings },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity" onClick={onClose} />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen print:hidden
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 bg-primary-600`}>
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-800 dark:text-white">SCMS</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1 h-[calc(100vh-160px)] overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};