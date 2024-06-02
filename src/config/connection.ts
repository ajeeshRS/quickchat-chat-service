import mongoose from "mongoose";

export const connectDb = () => {

    const mongoUri: string = process.env.MONGO_URI || 'defaultMongoUri';

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in the environment variables');
    }
    mongoose
        .connect(mongoUri)
        .catch((err) => console.log(err));

    const db = mongoose.connection;

    db.once("open", () => {
        console.log("connection succeed");
    });

    db.on("error", (err) => {
        console.log("error:", err);
    });
}

