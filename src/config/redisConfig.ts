import { createClient } from "redis";

export const createRedisClients = async () => {

    const pubClient = createClient()
    const subClient = pubClient.duplicate()

    await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);

    return { pubClient, subClient }
}


