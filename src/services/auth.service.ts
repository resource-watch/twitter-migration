import logger from 'logger';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UnprocessableEntityError from 'errors/unprocessableEntity.error';
import UserModel, { IUser } from 'models/user.model';

class AuthService {

    static async getUserById(id):Promise<IUser> {
        const isValidId = mongoose.Types.ObjectId.isValid(id);

        if (!isValidId) {
            logger.info(`[Auth Service - getUserById] - Invalid id ${id} provided`);
            throw new UnprocessableEntityError(`Invalid id ${id} provided`);
        }
        return UserModel.findById(id).select('-password -salt -userToken -__v').exec();
    }

    static async migrateToUsernameAndPassword(user:IUser, email:string, password:string):Promise<IUser> {
        if (!user) {
            return null;
        }

        const salt = bcrypt.genSaltSync();

        user.provider = 'local';
        delete user.providerId;
        user.email = email;
        user.password = bcrypt.hashSync(password, salt);

        user.updatedAt = new Date();

        return user.save();
    }

}

export default AuthService;
