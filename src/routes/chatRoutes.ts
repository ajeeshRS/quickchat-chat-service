import express from "express"
import { getAllChats } from "../controllers/chatController";

const router = express.Router()


router.get("/chats",getAllChats)


export default router;