import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {Server} from "socket.io";
const app=express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))


app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import googleRouter from './routes/google.routes.js'
app.use('/api/google',googleRouter);
export default app;