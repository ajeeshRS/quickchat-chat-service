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
    const httpServer: any = app.listen(PORT, async () => {
      connectDb()
      console.log(`Connected to chat service on port : ${PORT}`)
    })

    const { pubClient, subClient } = await createRedisClients()

    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    // redis adapter for socket io
    io.adapter(createAdapter(pubClient, subClient))

    io.use((socket, next) => {
      console.log('middleware invoked')
      socketAuthMiddleware(socket, next)
    })


    io.on("connection", (socket) => {
      handleSocketConnection(socket)

      socket.on("userOnline", (status) => {
        handleStatusUpdation(socket, status)
      })

      socket.on("disconnect", () => {
        handleStatusUpdation(socket, 'offline')
      })

      socket.on("send-message", ({ message, socketId }) => {
        socket.to(socketId).emit('receive-message', message)
      })

    })


  } catch (err) {
    console.error("Couldn't start the server")
  }
}


startServer()


