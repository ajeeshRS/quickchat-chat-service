import { kafka } from "../../config/kafkaConfig";

const consumer = kafka.consumer({ groupId: 'chat-group' })

export const consumeMessage = async (topic: string, callback: (message: any) => void) => {

    try {

        await consumer.connect()
        await consumer.subscribe({ topic, fromBeginning: true })

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                try {
                    const messageValue = message.value?.toString()
                    if (!messageValue) {
                        console.error("Message value undefined or empty")
                        return;
                    }
                    const parsedMessage = JSON.parse(messageValue)
                    callback(parsedMessage)

                } catch (err) {
                    console.error("Error proccessing message: ", err)
                }
            }
        })
    } catch (err) {
        console.log("Error consuming message: ", err)
    }
}