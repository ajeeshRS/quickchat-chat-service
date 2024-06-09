import { Socket } from "socket.io";
import { UserConnection } from "../models/userConnectionSchema";

export const handleSocketConnection = async (socket: Socket) => {
    console.log(`user connected with id ${socket.id}`)
    const { id } = socket.data.userData;
    try {
        await UserConnection.findOneAndUpdate(
            { userId: id },
            { socketId: socket.id },
            { upsert: true, new: true }
        );
        console.log("User connection created ")
    } catch (err) {
        console.error(err)
    }
}