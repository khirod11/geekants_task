import { create } from 'zustand';
import type { User, Project, Assignment } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

interface ResourceState {
  users: User[];
  projects: Project[];
  assignments: Assignment[];
  setUsers: (users: User[]) => void;
  setProjects: (projects: Project[]) => void;
  setAssignments: (assignments: Assignment[]) => void;
  addUser: (user: User) => void;
  addProject: (project: Project) => void;
  addAssignment: (assignment: Assignment) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  removeUser: (id: string) => void;
  removeProject: (id: string) => void;
  removeAssignment: (id: string) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    if (token) localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export const useResource = create<ResourceState>((set) => ({
  users: [],
  projects: [],
  assignments: [],
  setUsers: (users) => set({ users }),
  setProjects: (projects) => set({ projects }),
  setAssignments: (assignments) => set({ assignments }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [...state.assignments, assignment] })),
  updateUser: (id, userData) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === id ? { ...user, ...userData } : user
      ),
    })),
  updateProject: (id, projectData) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project._id === id ? { ...project, ...projectData } : project
      ),
    })),
  updateAssignment: (id, assignmentData) =>
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment._id === id ? { ...assignment, ...assignmentData } : assignment
      ),
    })),
  removeUser: (id) =>
    set((state) => ({ users: state.users.filter((user) => user._id !== id) })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project._id !== id),
    })),
  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter(
        (assignment) => assignment._id !== id
      ),
    })),
})); 