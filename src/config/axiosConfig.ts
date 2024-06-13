import axios from "axios";

export const authServiceApi = axios.create({
    baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:8000/api/v1/auth'
})
export const userServiceApi = axios.create({
    baseURL: process.env.USER_SERVICE_URL || 'http://localhost:8002/api/v1/user'
})