"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.DynamoUserRepositoryRef = exports.MongoUserRepository = void 0;
const user_schema_js_1 = require("../db/schemas/user.schema.js");
class MongoUserRepository {
    async findByUserId(userId) {
        return user_schema_js_1.UserModel.findOne({ userId: userId.toLowerCase().trim() }).exec();
    }
    async findById(id) {
        return user_schema_js_1.UserModel.findById(id).exec();
    }
    async findAll() {
        return user_schema_js_1.UserModel.find({}, '-passwordHash').sort({ createdAt: -1 }).exec();
    }
    async create(userData) {
        const user = new user_schema_js_1.UserModel({
            ...userData,
            userId: userData.userId.toLowerCase().trim(),
        });
        return user.save();
    }
    async update(id, updateData) {
        return user_schema_js_1.UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
            .select('-passwordHash')
            .exec();
    }
    async delete(id) {
        const result = await user_schema_js_1.UserModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    async updateLastLogin(userId) {
        await user_schema_js_1.UserModel.updateOne({ userId: userId.toLowerCase().trim() }, { $set: { lastLoginAt: new Date() } }).exec();
    }
}
exports.MongoUserRepository = MongoUserRepository;
/**
 * DynamoDB Repository Seam Reference (Architecture Demonstration)
 * Showcases how this enterprise architecture can swap from MongoDB to AWS DynamoDB
 * by implementing the exact same IUserRepository interface.
 */
class DynamoUserRepositoryRef {
    async findByUserId(userId) {
        // In production with AWS SDK v3:
        // return dynamoClient.send(new GetItemCommand({ TableName: 'MPloyChek_Users', Key: { userId: { S: userId } } }));
        throw new Error('DynamoDB driver active only when persistence provider is set to AWS_DYNAMODB');
    }
    async findById(id) { throw new Error('Not implemented in mock'); }
    async findAll() { throw new Error('Not implemented in mock'); }
    async create(userData) { throw new Error('Not implemented in mock'); }
    async update(id, updateData) { throw new Error('Not implemented in mock'); }
    async delete(id) { throw new Error('Not implemented in mock'); }
    async updateLastLogin(userId) { throw new Error('Not implemented in mock'); }
}
exports.DynamoUserRepositoryRef = DynamoUserRepositoryRef;
exports.userRepository = new MongoUserRepository();
