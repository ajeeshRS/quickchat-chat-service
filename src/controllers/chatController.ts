import { Request, Response } from "express";
import { Chat } from "../models/chatModel";
import { userServiceApi } from "../config/axiosConfig";

export const creatNewChat = async (message: any) => {
  try {
    const { userName, peerUserName, id, peerId } = message;
    // console.log(userName, peerUserName, id, peerId);

    // check for possible chat names
    const chatName = `${userName} and ${peerUserName}`;
    const possibleChatName = `${peerUserName} and ${userName}`;

    // checking the chat exist or not
    const isChatExist = await Chat.findOne({
      $or: [{ chatName: chatName }, { chatName: possibleChatName }],
    });

    if (isChatExist) {
      console.log("chat already exist for these users: ", isChatExist);
      return;
    }

    const newChat = await Chat.create({
      chatName: chatName,
      members: [id, peerId],
    });

    const data = {
      chatId: newChat._id,
      userId: id,
      peerId,
    };
    
    // adding chat to user profiles
    const res = await userServiceApi.post("/add-chat", data);

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

// for getting chat id
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

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.body;
  } catch (err) {
    console.error("Error in fetching messages: ", err);
    res.status(500).json("Internal server error");
  }
};
