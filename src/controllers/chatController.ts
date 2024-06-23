import { Request, Response } from "express";
import { Chat } from "../models/chatModel";

export const creatNewChat = async (message: any) => {
    try {
        const { userName, peerUserName, id, peerId } = message
        console.log(userName, peerUserName, id, peerId)

        const chatName = `${userName} and ${peerUserName}`
        await Chat.create({
            chatName: chatName,
            members: [id, peerId]
        })

        console.log(`${chatName} chat created`)

    } catch (err) {
        console.error("Error in creating new chat", err)
    }
}
