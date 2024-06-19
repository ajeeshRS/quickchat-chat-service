import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/connection";
import { Server } from "socket.io";
import routes from "./routes/chatRoutes";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import { handleSocketConnection, handleStatusUpdation } from "./controllers/socketController";
import { userServiceApi } from "./config/axiosConfig";
import { createClient } from "redis"
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClients } from "./config/redisConfig";

dotenv.config();
const PORT = process.env.PORT || 8001;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/chat", routes)


const startServer = async () => {

  try {
    //  starting http server
    const httpServer: any = app.listen(PORT, async () => {
      connectDb()
      console.log(`Connected to chat service on port : ${PORT}`)
    })

    // redis clients
    const { pubClient, subClient } = await createRedisClients()

    // init socket io server
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    // redis adapter for socket io
    io.adapter(createAdapter(pubClient, subClient))

    // socket io middleware
    io.use((socket, next) => {
      console.log('middleware invoked')
      socketAuthMiddleware(socket, next)
    })

    let onlineUsers: any = {}
    let typingUsers: any = {}

    // on socket connection
    io.on("connection", (socket) => {

      // handling socket connection
      handleSocketConnection(socket)

      // when user on online
      socket.on("userOnline", (status) => {
        handleStatusUpdation(socket, status)
        onlineUsers[socket.data.userData.email] = socket.id
        io.emit("online-users", onlineUsers)
      })

      // when user typing
      socket.on('typing', (data) => {
        console.log(`${data.sender} is typing...`)
        typingUsers[data.recipient] = data.sender

        socket.to(data.recipientSocketId).emit("typing", data.sender)
      })

      // when user stop typing
      socket.on('stopTyping', (data) => {
        console.log(`${data.sender} is not typing.`)
        delete typingUsers[data.recipient]
        
        socket.to(data.recipientSocketId).emit("stopTyping", data.sender)
      })

      // on user disconnection
      socket.on("disconnect", () => {
        handleStatusUpdation(socket, 'offline')
        for (const userId in onlineUsers) {
          if (onlineUsers[userId] === socket.id) {
            delete onlineUsers[userId]
            io.emit("online-users", onlineUsers)
            break;
          }
        }
      })

      // on user sends a message
      socket.on("send-message", ({ message, socketId, email }) => {
        const data = {
          message: message,
          recipient: email,
          sender: socket.data.userData.email //getting userdata from the socket object
        }
        console.log(message, socketId)

        // sending message to recipient
        socket.to(socketId).emit('receive-message', data)
      })
    })
  } catch (err) {
    console.error("Couldn't start the server: ", err)
  }
}

startServer()


