import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/connection";
import { Server } from "socket.io";
import routes from "./routes/chatRoutes";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import {
  handleSocketConnection,
  handleStatusUpdation,
} from "./controllers/socketController";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClients } from "./config/redisConfig";
import { consumeMessage } from "./utils/kafka/chat-consumer";
import { creatNewChat, getChatId } from "./controllers/chatController";
import { Message } from "./models/messageModel";
import { Chat } from "./models/chatModel";
import { userServiceApi } from "./config/axiosConfig";

dotenv.config();
const PORT = process.env.PORT || 8001;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/chat", routes);

const startServer = async () => {
  try {
    //  starting http server
    const httpServer: any = app.listen(PORT, async () => {
      connectDb();
      await consumeMessage("new-chat", creatNewChat);
      console.log(`Connected to chat service on port : ${PORT}`);
    });

    // redis clients
    const { pubClient, subClient } = await createRedisClients();

    // init socket io server
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    // redis adapter for socket io
    io.adapter(createAdapter(pubClient, subClient));

    // socket io middleware
    io.use((socket, next) => {
      console.log("middleware invoked");
      socketAuthMiddleware(socket, next);
    });

    let onlineUsers: Record<string, string> = {};
    let typingUsers: Record<string, string> = {};

    // on socket connection
    io.on("connection", (socket) => {

      // handling socket connection
      handleSocketConnection(socket);

      const updatedData = {
        email: socket.data.userData.email,
        socketId: socket.id,
      };
      io.emit("updateSocket", updatedData);

      const userChannel = `user:${socket.data.userData.email}`;

      // subscribe to their own channel
      subClient.subscribe(userChannel, (data) => {
        const { message, socketId, sender, recipient } = JSON.parse(data);

        const dataTosend = {
          message: message,
          sender: sender,
          recipient: recipient,
        };

        console.log(`message from ${userChannel} channel: ${data}`);
        io.to(socketId).emit("receive-message", dataTosend);
      });

      // when user on online
      socket.on("userOnline", (status) => {
        handleStatusUpdation(socket, status);
        onlineUsers[socket.data.userData.email] = socket.id;
        io.emit("online-users", onlineUsers);
      });

      // on user disconnection
      socket.on("disconnect", () => {
        handleStatusUpdation(socket, "offline");

        // unsubscribing on disconnection
        subClient.unsubscribe(userChannel);

        for (const userId in onlineUsers) {
          if (onlineUsers[userId] === socket.id) {
            delete onlineUsers[userId];
            io.emit("online-users", onlineUsers);
            break;
          }
        }
      });

      // when user typing
      socket.on("typing", (data) => {
        console.log(`${data.sender} is typing...`);
        typingUsers[data.recipient] = data.sender;

        socket.to(data.recipientSocketId).emit("typing", data.sender);
      });

      // when user stop typing
      socket.on("stopTyping", (data) => {
        console.log(`${data.sender} is not typing.`);
        delete typingUsers[data.recipient];

        socket.to(data.recipientSocketId).emit("stopTyping", data.sender);
      });

      // on user sends a message
      socket.on("send-message", async ({ message, socketId, email }) => {

        const data = {
          message: message,
          recipient: email,
          sender: socket.data.userData.email, //getting userdata from the socket object
          socketId: socketId,
        };
        console.log(message, socketId);

        const recipientChannel = `user:${email}`;

        const res: any = await userServiceApi.get("/usersDetails", {
          params: {
            senderEmail: socket.data.userData.email,
            recipientEmail: email,
          },
        });

        // console.log(res.data)
        const usersDetails: any[] = res.data;

        const possibleChatName1 = `${usersDetails[0].username} and ${usersDetails[1].username}`;
        const possibleChatName2 = `${usersDetails[1].username} and ${usersDetails[0].username}`;
        const chatId = await getChatId(possibleChatName1, possibleChatName2);
        // console.log(chatId);

        // publishing message
        pubClient.publish(recipientChannel, JSON.stringify(data));

        interface senderDetails {
          _id: string;
          username: string;
          email: string;
        }
        
        const senderDetails: senderDetails[] = usersDetails.filter(
          (userData: any) => userData.email === socket.data.userData.email
        );
        // console.log(senderDetails);

        const result = await Message.create({
          chat: chatId,
          sender: senderDetails[0]._id,
          content: message,
        });

        console.log(result);
      });
    });
  } catch (err) {
    console.error("Couldn't start the server: ", err);
  }
};

startServer();
