import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        default: '',
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userProfile',
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    }
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);
