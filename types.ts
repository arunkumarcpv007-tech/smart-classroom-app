export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  classId?: string;
  rollNo?: string;
  xp?: number;
  themeColor?: string; // New: Persistent accent color preference
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: 'present' | 'absent';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  classId: string;
  completed: boolean;
  assignedTo: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  classId: string;
  status: 'pending' | 'submitted' | 'graded';
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  uploadedBy: string;
  classId: string;
  date: string;
}