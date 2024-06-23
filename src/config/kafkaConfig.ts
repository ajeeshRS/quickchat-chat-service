import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'chat-service',
    brokers: ['localhost:9092']
})