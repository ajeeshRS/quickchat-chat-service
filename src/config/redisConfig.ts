import { createClient } from "redis";

export const createRedisClients = async () => {

    const pubClient = createClient()
    const subClient = pubClient.duplicate()

    await pubClient.connect()
    await subClient.connect()

    return { pubClient, subClient }
}


