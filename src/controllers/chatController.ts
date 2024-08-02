import { Request, Response } from "express";
import { Chat } from "../models/chatModel";

export const creatNewChat = async (message: any) => {
  try {
    const { userName, peerUserName, id, peerId } = message;
    // console.log(userName, peerUserName, id, peerId);

    const chatName = `${userName} and ${peerUserName}`;
    const possibleChatName = `${peerUserName} and ${userName}`;

    const isChatExist = await Chat.findOne({
      $or: [{ chatName: chatName }, { chatName: possibleChatName }],
    });

    if (isChatExist) {
      console.log("chat already exist for these users: ", isChatExist);
      return;
    }

    await Chat.create({
      chatName: chatName,
      members: [id, peerId],
    });

    console.log(`${chatName} chat created`);
  } catch (err) {
    console.error("Error in creating new chat", err);
  }
};

export const createNewMessage = async (
  sender: string,
  chatName: string,
  message: string,
  recipient: string
) => {
  try {
    if (!sender || !chatName || !message || !recipient) {
      console.log("Missing details");
    }
  } catch (err) {
    console.error("Error in creating new message: ", err);
  }
};

export const getChatId = async (name1: string, name2: string) => {
  try {
    const result: any = await Chat.findOne(
      {
        $or: [{ chatName: name1 }, { chatName: name2 }],
      },
      { chatName: 1, _id: 1 }
    );
    // console.log(`chatname: ${result.chatName}`);
    return result._id;
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};
