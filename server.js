import {app} from "./app.js";
import { connectDB } from "./data/database.js";
import dotenv from "dotenv"
import {v2 as cloudinary} from 'cloudinary'

//handling uncaught exceptions
process.on("uncaughtException",(err)=>{
    console.log(err.message);
    console.log("Shutting down server forcely due to some uncaught exceptions");
    process.exit(1);
})

//config path
dotenv.config({path:"./data/config.env"});

//database connection
connectDB();

//cloudinary configuration
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

//listening server 
const server = app.listen(process.env.PORT,()=>{
    console.log(`Server working on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV}`);
})

//unhandled promise rejections -- like mongodb connection reject
process.on("unhandledRejection",(err)=>{
    console.log(err.message);
    console.log("Shutting down server forcely due to some unhandled promise rejections");

    server.close(()=>{
        process.exit(1);
    })
})