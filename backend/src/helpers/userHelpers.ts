import { UserModel } from '../models/user.models';
import { ConflictError } from '../errors/ConflictError';

export async function assertUserNotExists(email: string): Promise<void> {
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }
}