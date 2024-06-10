import mongoose from 'mongoose';

const userConnectionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    socketId: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true });

export const UserConnection = mongoose.model('UserConnection', userConnectionSchema);
