import axios from 'axios';
import type { User, Project, Assignment, AuthResponse, RegisterUserData } from './types';

const api = axios.create({
  baseURL: (import.meta.env.API_URL || 'http://localhost:3000') + '/api',
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (userData: Partial<RegisterUserData>) =>
    api.post<User>('/users', userData),
};

// Users API
export const users = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (userData: Partial<User>) => api.post<User>('/users', userData),
  update: (id: string, userData: Partial<User>) =>
    api.patch<User>(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Projects API
export const projects = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (projectData: Partial<Project>) =>
    api.post<Project>('/projects', projectData),
  update: (id: string, projectData: Partial<Project>) =>
    api.patch<Project>(`/projects/${id}`, projectData),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Assignments API
export const assignments = {
  getAll: () => api.get<Assignment[]>('/assignments'),
  getByEngineerId: (engineerId: string) =>
    api.get<Assignment[]>(`/assignments/engineer/${engineerId}`),
  getByProjectId: (projectId: string) =>
    api.get<Assignment[]>(`/assignments/project/${projectId}`),
  create: (assignmentData: Partial<Assignment>) =>
    api.post<Assignment>('/assignments', assignmentData),
  update: (id: string, assignmentData: Partial<Assignment>) =>
    api.patch<Assignment>(`/assignments/${id}`, assignmentData),
  delete: (id: string) => api.delete(`/assignments/${id}`),
  getEngineerCapacity: (engineerId: string) =>
    api.get<number>(`/assignments/engineers/${engineerId}/capacity`),
}; 