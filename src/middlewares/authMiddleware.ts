import axios from "axios"
import { Server, Socket } from "socket.io"
import { authServiceApi } from "../config/axiosConfig"

export const socketAuthMiddleware = async (socket: Socket<Server>, next: (err?: Error | undefined) => void) => {

    const token = socket.handshake.auth.token

    if (!token) {
        console.log("no token")
        return next(new Error('authentication error'))
    }

    try {
        const res = await authServiceApi.get('/verify-jwt', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const userData = res.data.decoded.user
        socket.data.userData = userData
        next()
    } catch (err: any) {
        console.error(err.response)
    }
}