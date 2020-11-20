import mongoose from 'mongoose';
import UserModel from 'models/user.model';

const { ObjectId } = mongoose.Types;

const getUUID = () => Math.random().toString(36).substring(7);


const createUser = (userData = {}) => ({
    _id: new ObjectId(),
    name: `${getUUID()} name`,
    email: `${getUUID()}@control-tower.com`,
    password: '$password.hash',
    salt: '$password.salt',
    extraUserData: {
        apps: ['rw']
    },
    role: 'USER',
    provider: 'local',
    userToken: 'myUserToken',
    photo: `http://photo.com/${getUUID()}.jpg`,
    ...userData
});

const createUserInDB = async (userData:Record<string, any>) => {
    const user = await new UserModel(createUser(userData)).save();

    return {
        id: user._id.toString(),
        role: user.role,
        provider: user.provider,
        email: user.email,
        extraUserData: user.extraUserData,
        createdAt: Date.now(),
        photo: user.photo,
        name: user.name
    };
};


export {
    createUser,
    getUUID,
    createUserInDB
};
