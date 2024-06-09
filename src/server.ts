import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/connection";
import { Server } from "socket.io";
import routes from "./routes/chatRoutes";
import axios from "axios";
import { UserConnection } from "./models/userConnectionSchema";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import { handleSocketConnection } from "./controllers/socketController";

dotenv.config();
const PORT = process.env.PORT || 8001;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/chat", routes)

const httpServer = app.listen(PORT, () => {
  connectDb()
  console.log(`Connected to chat service on port : ${PORT}`)
})

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:80",
  },
});

io.use(socketAuthMiddleware)

io.on("connection", (socket) => {
  handleSocketConnection(socket)
})
// 
