import { User, Class, AttendanceRecord, Assignment, Note, UserRole, Notification, Task } from '../types';

const SEED_USERS: User[] = [
  { id: 'u1', name: 'Admin Master', email: 'admin@scms.com', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=u1', xp: 0 },
  { id: 'u2', name: 'Sarah Wilson', email: 'teacher@scms.com', role: UserRole.TEACHER, avatar: 'https://i.pravatar.cc/150?u=u2', xp: 0 },
  { id: 'u3', name: 'John Doe', email: 'student@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '101', avatar: 'https://i.pravatar.cc/150?u=u3', xp: 850 },
  { id: 'u4', name: 'Emma Watson', email: 'emma@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '102', avatar: 'https://i.pravatar.cc/150?u=u4', xp: 920 },
  { id: 'u5', name: 'Michael Smith', email: 'michael@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '103', avatar: 'https://i.pravatar.cc/150?u=u5', xp: 740 },
  { id: 'u6', name: 'Sophia Brown', email: 'sophia@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '104', avatar: 'https://i.pravatar.cc/150?u=u6', xp: 610 },
  { id: 'u7', name: 'Daniel Wilson', email: 'daniel@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '105', avatar: 'https://i.pravatar.cc/150?u=u7', xp: 550 },
  { id: 'u8', name: 'Olivia Garcia', email: 'olivia@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '106', avatar: 'https://i.pravatar.cc/150?u=u8', xp: 490 },
  { id: 'u9', name: 'James Miller', email: 'james@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '107', avatar: 'https://i.pravatar.cc/150?u=u9', xp: 950 },
  { id: 'u10', name: 'Isabella Davis', email: 'isabella@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '108', avatar: 'https://i.pravatar.cc/150?u=u10', xp: 820 },
  { id: 'u11', name: 'Ethan Rodriguez', email: 'ethan@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '109', avatar: 'https://i.pravatar.cc/150?u=u11', xp: 300 },
  { id: 'u12', name: 'Mia Martinez', email: 'mia@scms.com', role: UserRole.STUDENT, classId: 'c1', rollNo: '110', avatar: 'https://i.pravatar.cc/150?u=u12', xp: 450 },
];

const SEED_NOTES: Note[] = [
  { id: 'n1', title: 'Introduction to Calculus', subject: 'Mathematics', content: 'Fundamentals of derivatives and integrals.', uploadedBy: 'u2', classId: 'c1', date: '2024-12-01' },
  { id: 'n2', title: 'Newtonian Physics', subject: 'Physics', content: 'Three laws of motion and universal gravitation.', uploadedBy: 'u2', classId: 'c1', date: '2024-12-05' },
  { id: 'n3', title: 'Cell Biology', subject: 'Science', content: 'Structure and function of eukaryotic cells.', uploadedBy: 'u2', classId: 'c1', date: '2024-12-10' },
  { id: 'n4', title: 'Shakespearean Sonnets', subject: 'English', content: 'Analysis of Sonnet 18 and poetic devices.', uploadedBy: 'u2', classId: 'c1', date: '2024-12-12' },
];

const KEYS = {
  USERS: 'scms_users_v4',
  CLASSES: 'scms_classes_v4',
  ATTENDANCE: 'scms_attendance_v4',
  TASKS: 'scms_tasks_v4',
  ASSIGNMENTS: 'scms_assignments_v4',
  NOTES: 'scms_notes_v4',
  NOTIFICATIONS: 'scms_notifications_v4',
  CURRENT_USER: 'scms_current_user_v4',
  THEME: 'scms_theme_v4'
};

export const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([
      { id: 'n1', title: 'Welcome!', message: 'Welcome to your premium classroom dashboard.', time: 'Just now', read: false }
    ]));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
    localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(KEYS.NOTES, JSON.stringify(SEED_NOTES));
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify([]));
  }
};

const getItems = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setItems = <T>(key: string, items: T[]) => localStorage.setItem(key, JSON.stringify(items));

export const StorageService = {
  getUsers: () => getItems<User>(KEYS.USERS),
  getAttendance: () => getItems<AttendanceRecord>(KEYS.ATTENDANCE),
  getTasks: () => getItems<Task>(KEYS.TASKS),
  getAssignments: () => getItems<Assignment>(KEYS.ASSIGNMENTS),
  getNotes: () => getItems<Note>(KEYS.NOTES),
  getNotifications: () => getItems<Notification>(KEYS.NOTIFICATIONS),

  addUser: (user: User) => {
    const users = getItems<User>(KEYS.USERS);
    setItems(KEYS.USERS, [...users, user]);
  },

  deleteUser: (id: string) => {
    setItems(KEYS.USERS, getItems<User>(KEYS.USERS).filter(u => u.id !== id));
  },

  updateUser: (updatedUser: User) => {
    const users = getItems<User>(KEYS.USERS);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      setItems(KEYS.USERS, users);
      const current = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
      if (current && current.id === updatedUser.id) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      }
    }
  },

  giveXP: (studentId: string, amount: number) => {
    const users = getItems<User>(KEYS.USERS);
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      users[index].xp = (users[index].xp || 0) + amount;
      setItems(KEYS.USERS, users);
    }
  },

  addTask: (task: Task) => {
    const tasks = getItems<Task>(KEYS.TASKS);
    setItems(KEYS.TASKS, [...tasks, task]);
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = getItems<Task>(KEYS.TASKS);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      setItems(KEYS.TASKS, tasks);
    }
  },

  deleteTask: (id: string) => {
    setItems(KEYS.TASKS, getItems<Task>(KEYS.TASKS).filter(t => t.id !== id));
  },

  clearNotifications: () => {
    setItems(KEYS.NOTIFICATIONS, []);
  },

  saveAttendance: (record: AttendanceRecord) => {
    const all = getItems<AttendanceRecord>(KEYS.ATTENDANCE);
    const filtered = all.filter(a => !(a.date === record.date && a.studentId === record.studentId));
    setItems(KEYS.ATTENDANCE, [...filtered, record]);
  },

  markAllPresent: (date: string, studentIds: string[], classId: string) => {
    const all = getItems<AttendanceRecord>(KEYS.ATTENDANCE);
    const filtered = all.filter(a => !(a.date === date && studentIds.includes(a.studentId)));
    const newRecords: AttendanceRecord[] = studentIds.map(id => ({
      id: Math.random().toString(36).substr(2, 9),
      date,
      studentId: id,
      classId,
      status: 'present'
    }));
    setItems(KEYS.ATTENDANCE, [...filtered, ...newRecords]);
  },

  addAssignment: (a: Assignment) => {
    setItems(KEYS.ASSIGNMENTS, [...getItems<Assignment>(KEYS.ASSIGNMENTS), a]);
  },

  updateAssignment: (id: string, updates: Partial<Assignment>) => {
    const assignments = getItems<Assignment>(KEYS.ASSIGNMENTS);
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updates };
      setItems(KEYS.ASSIGNMENTS, assignments);
    }
  },

  addNote: (n: Note) => {
    setItems(KEYS.NOTES, [...getItems<Note>(KEYS.NOTES), n]);
  },

  deleteNote: (id: string) => {
    setItems(KEYS.NOTES, getItems<Note>(KEYS.NOTES).filter(n => n.id !== id));
  },

  login: (email: string, role: UserRole) => {
    const user = getItems<User>(KEYS.USERS).find(u => u.email === email && u.role === role);
    if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  logout: () => localStorage.removeItem(KEYS.CURRENT_USER),
  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null'),
  getTheme: () => localStorage.getItem(KEYS.THEME) || 'light',
  setTheme: (theme: string) => localStorage.setItem(KEYS.THEME, theme),

  exportCSV: (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => Object.values(obj).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};