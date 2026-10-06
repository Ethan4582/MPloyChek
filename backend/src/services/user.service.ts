import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { CreateUserInput, UpdateUserInput, IUser } from '../types/index.js';

export class UserService {
  async getAllUsers(): Promise<Omit<IUser, 'passwordHash'>[]> {
    const users = await userRepository.findAll();
    return users.map((u) => ({
      _id: u._id.toString(),
      userId: u.userId,
      name: u.name,
      role: u.role,
      department: u.department,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  async getUserById(id: string): Promise<Omit<IUser, 'passwordHash'> | null> {
    const user = await userRepository.findById(id);
    if (!user) return null;
    return {
      _id: user._id.toString(),
      userId: user.userId,
      name: user.name,
      role: user.role,
      department: user.department,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(input: CreateUserInput): Promise<Omit<IUser, 'passwordHash'>> {
    const existing = await userRepository.findByUserId(input.userId);
    if (existing) {
      throw { status: 409, message: `User with ID '${input.userId}' already exists.` };
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const newUser = await userRepository.create({
      ...input,
      passwordHash,
    });

    return {
      _id: newUser._id.toString(),
      userId: newUser.userId,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<Omit<IUser, 'passwordHash'> | null> {
    const updatePayload: any = { ...input };
    if (input.password) {
      updatePayload.passwordHash = await bcrypt.hash(input.password, 10);
      delete updatePayload.password;
    }

    const updated = await userRepository.update(id, updatePayload);
    if (!updated) return null;

    return {
      _id: updated._id.toString(),
      userId: updated.userId,
      name: updated.name,
      role: updated.role,
      department: updated.department,
      status: updated.status,
      lastLoginAt: updated.lastLoginAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteUser(id: string, currentAdminUserId: string): Promise<boolean> {
    const targetUser = await userRepository.findById(id);
    if (!targetUser) {
      throw { status: 404, message: 'User not found' };
    }

    if (targetUser.userId === currentAdminUserId) {
      throw { status: 400, message: 'Admin cannot delete their own active account.' };
    }

    return userRepository.delete(id);
  }

  async toggleStatus(id: string): Promise<Omit<IUser, 'passwordHash'>> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    const updated = await userRepository.update(id, { status: newStatus });
    if (!updated) {
      throw { status: 500, message: 'Failed to update user status' };
    }

    return {
      _id: updated._id.toString(),
      userId: updated.userId,
      name: updated.name,
      role: updated.role,
      department: updated.department,
      status: updated.status,
      lastLoginAt: updated.lastLoginAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

export const userService = new UserService();
