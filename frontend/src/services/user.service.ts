import api from '../lib/axios';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UserService {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateUserDto): Promise<User> {
    try {
      const response = await api.patch('/users/profile/update', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.patch('/users/profile/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get user with ID ${id}:`, error);
      throw error;
    }
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Failed to update user role for ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to delete user with ID ${id}:`, error);
      throw error;
    }
  }
}

export const userService = new UserService();