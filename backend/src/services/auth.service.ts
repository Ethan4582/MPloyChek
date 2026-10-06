import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { LoginInput, AuthTokenPayload, IUser } from '../types/index.js';

export class AuthService {
  async login(input: LoginInput): Promise<{
    token: string;
    user: Omit<IUser, 'passwordHash'>;
    expiresIn: string;
  }> {
    const user = await userRepository.findByUserId(input.userId);

    if (!user) {
      throw { status: 401, message: 'Invalid credentials. User ID not found.' };
    }

    if (user.status === 'Disabled') {
      throw { status: 403, message: 'Account is currently suspended. Please contact an Administrator.' };
    }

    // Role check: verifies the user holds the role requested during login
    if (user.role !== input.role) {
      throw {
        status: 403,
        message: `Role mismatch: User '${input.userId}' is registered as '${user.role}', but login was attempted with role '${input.role}'.`,
      };
    }

    if (!user.passwordHash) {
      throw { status: 401, message: 'Invalid credentials. Password not configured.' };
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid credentials. Incorrect password.' };
    }

    // Update last login
    await userRepository.updateLastLogin(user.userId);

    const payload: AuthTokenPayload = {
      userId: user.userId,
      role: user.role,
      name: user.name,
      department: user.department,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    return {
      token,
      expiresIn: config.jwtExpiresIn,
      user: {
        _id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        role: user.role,
        department: user.department,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getCurrentUser(userId: string): Promise<Omit<IUser, 'passwordHash'>> {
    const user = await userRepository.findByUserId(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

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
}

export const authService = new AuthService();
