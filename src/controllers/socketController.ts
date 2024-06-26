import { Socket } from "socket.io";
import { UserConnection } from "../models/userConnectionSchema";
import { userServiceApi } from "../config/axiosConfig";

export const handleSocketConnection = async (socket: Socket) => {
    console.log(`user connected with id ${socket.id}`)
    // getting user email from the socket object
    const { email } = socket.data.userData;

    try {
        // creates new connection if not exists else updates it
        await UserConnection.findOneAndUpdate(
            { email: email },
            { socketId: socket.id },
            { upsert: true, new: true }
        );

        console.log("User connection created ")

        // aggregation pipeline for getting client details on connection 
        const result = await UserConnection.aggregate([
            {
                $match: { email: email }
            },
            {
                $lookup: {
                    from: "userprofiles",
                    localField: "email",
                    foreignField: "email",
                    as: "user_profile_docs"
                }
            },
            {
                $unwind: "$user_profile_docs"
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$user_profile_docs", "$$ROOT"]
                    }
                }
            },
            {
                $project: {
                    user_profile_docs: 0,// Exclude the 'user_profile_docs' field from the output
                    createdAt: 0,
                    updatedAt: 0,
                    _id: 0,
                    __v: 0
                }
            }
        ]);

        // emits event for client
        socket.emit('user-connection', result)
    } catch (err) {
        console.error('Err: ', err)
    }
}

export const handleStatusUpdation = async (socket: Socket, status: string) => {
    try {
        const { email } = socket.data.userData;
        const data = {
            email: email,
            status: status
        }
        // sending request to userService for updating user status(online/offline)
        const res = await userServiceApi.put('/update-status', data)
        console.log(res.data)
    } catch (err) {
        console.error('some error occured during update: ', err)
    }
}