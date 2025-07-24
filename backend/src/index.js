import app from './app.js'
import { db_name } from './constants.js'
import dotenv from 'dotenv';
import connectDB from './db/db1.js';
dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8001,()=>{
        console.log(`server is running at port:${process.env.PORT || 8001}`)
    })

})
.catch((error)=>{
    console.log("mongo connection failed",error);
})