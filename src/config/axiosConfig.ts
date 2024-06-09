import axios from "axios";

export const authServiceApi = axios.create({
    baseURL:process.env.AUTH_SERVICE_URL
})