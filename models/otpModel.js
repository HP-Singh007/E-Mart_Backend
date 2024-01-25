import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    otp:String,
    otpExpires:Date,
    email:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
})
export default mongoose.model("Otp",otpSchema);