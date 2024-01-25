import mongoose from "mongoose";

export const connectDB = ()=>{
    mongoose.connect(process.env.DB_URI)
    .then((data)=>{
        console.log(`Database connected successfully to ${data.connection.host}`);
    })
    //no need of catch block as it is handled by promise rejections in server.js
}