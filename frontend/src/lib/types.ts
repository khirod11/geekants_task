export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'engineer' | 'manager';
  skills: string[];
  seniority: string;
  department: string;
  maxCapacity: number;
}

export interface RegisterUserData extends Omit<User, '_id'> {
  password: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  timeline: {
    startDate: string;
    endDate: string;
  };
  status: 'planning' | 'active' | 'completed';
  teamSize: number;
}

export interface Assignment {
  _id: string;
  engineerId: string | User;
  projectId: string | Project;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
} 