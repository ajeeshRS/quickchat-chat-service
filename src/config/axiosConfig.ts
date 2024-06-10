import axios from "axios";

export const authServiceApi = axios.create({
    baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:8000/api/v1/auth'
})