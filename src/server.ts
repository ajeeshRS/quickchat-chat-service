import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/connection";
import { Server } from "socket.io";

dotenv.config();
const PORT = process.env.PORT || 8001;
const app = express();

app.use(cors());
app.use(express.json());


const httpServer = app.listen(PORT, () => {
  connectDb()
  console.log(`Connected to user service on port : ${PORT}`)
})

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log(`user connected with id ${socket.id}`)
})
