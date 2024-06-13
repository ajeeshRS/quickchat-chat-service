import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/connection";
import { Server } from "socket.io";
import routes from "./routes/chatRoutes";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import { handleSocketConnection, handleStatusUpdation } from "./controllers/socketController";
import { userServiceApi } from "./config/axiosConfig";

dotenv.config();
const PORT = process.env.PORT || 8001;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/chat", routes)

const httpServer: any = app.listen(PORT, () => {
  connectDb()
  console.log(`Connected to chat service on port : ${PORT}`)
})

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

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

})


