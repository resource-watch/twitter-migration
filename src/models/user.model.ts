import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    photo: string;
    provider: string;
    providerId: string;
    email?: string;
    password?: string;
    salt?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    extraUserData: Record<string, any>;
    userToken?: string;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: false, trim: true },
    photo: { type: String, required: false, trim: true },
    provider: {
        type: String, required: true, trim: true, default: 'local'
    },
    providerId: { type: String, required: false, trim: true },
    email: { type: String, required: false, trim: true },
    password: { type: String, required: false, trim: true },
    salt: { type: String, required: false, trim: true },
    role: {
        type: String, required: true, default: 'USER', trim: true
    },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    extraUserData: { type: Schema.Types.Mixed },
    userToken: { type: String, required: false, trim: true }
});

export default mongoose.model<IUser>('User', UserSchema);
