import { IUser, CreateUserInput, UpdateUserInput } from '../types/index.js';
import { UserModel, UserDocument } from '../db/schemas/user.schema.js';

export interface IUserRepository {
  findByUserId(userId: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  findAll(): Promise<UserDocument[]>;
  create(userData: CreateUserInput & { passwordHash: string }): Promise<UserDocument>;
  update(id: string, updateData: UpdateUserInput): Promise<UserDocument | null>;
  delete(id: string): Promise<boolean>;
  updateLastLogin(userId: string): Promise<void>;
}

export class MongoUserRepository implements IUserRepository {
  async findByUserId(userId: string): Promise<UserDocument | null> {
    return UserModel.findOne({ userId: userId.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return UserModel.find({}, '-passwordHash').sort({ createdAt: -1 }).exec();
  }

  async create(userData: CreateUserInput & { passwordHash: string }): Promise<UserDocument> {
    const user = new UserModel({
      ...userData,
      userId: userData.userId.toLowerCase().trim(),
    });
    return user.save();
  }

  async update(id: string, updateData: UpdateUserInput): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .select('-passwordHash')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.updateOne(
      { userId: userId.toLowerCase().trim() },
      { $set: { lastLoginAt: new Date() } }
    ).exec();
  }
}

/**
 * DynamoDB Repository Seam Reference (Architecture Demonstration)
 * Showcases how this enterprise architecture can swap from MongoDB to AWS DynamoDB
 * by implementing the exact same IUserRepository interface.
 */
export class DynamoUserRepositoryRef implements IUserRepository {
  async findByUserId(userId: string): Promise<UserDocument | null> {
    // In production with AWS SDK v3:
    // return dynamoClient.send(new GetItemCommand({ TableName: 'MPloyChek_Users', Key: { userId: { S: userId } } }));
    throw new Error('DynamoDB driver active only when persistence provider is set to AWS_DYNAMODB');
  }
  async findById(id: string): Promise<UserDocument | null> { throw new Error('Not implemented in mock'); }
  async findAll(): Promise<UserDocument[]> { throw new Error('Not implemented in mock'); }
  async create(userData: any): Promise<UserDocument> { throw new Error('Not implemented in mock'); }
  async update(id: string, updateData: any): Promise<UserDocument | null> { throw new Error('Not implemented in mock'); }
  async delete(id: string): Promise<boolean> { throw new Error('Not implemented in mock'); }
  async updateLastLogin(userId: string): Promise<void> { throw new Error('Not implemented in mock'); }
}

export const userRepository: IUserRepository = new MongoUserRepository();
