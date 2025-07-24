import mongoose from "mongoose";

import { db_name } from "../constants.js";
const connectDB=async()=>{
    try {
        const connectInstance=await mongoose.connect(`${process.env.Mongo_URI}/${db_name}`)
        console.log(`Mongodb Connect !! dbhost:${connectInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB Error",error);
        process.exit(1)
    }
}

export default connectDB;