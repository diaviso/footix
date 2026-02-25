import api from '@/lib/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  admins: number;
  verified: number;
  pending: number;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usersService = {
  async getAll(page = 1, limit = 50, search?: string, role?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (role && role !== 'all') params.set('role', role);
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async getOne(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async toggleVerification(id: string): Promise<User> {
    const response = await api.patch(`/users/${id}/toggle-verification`);
    return response.data;
  },
};
