import mongoose from "mongoose";
import validator from "validator";
import crypto from "crypto"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Enter Name"],
        minLength:[5,"Enter Full Name"]
    },
    email:{
        type:String,
        required:[true,"Enter Email"],
        validate:[validator.isEmail,"Enter valid mail id"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Enter Password"],
        minLength:[8,"Min 8 characters"],
        select:false
    },
    role:{
        type:String,
        default:"User"
    },
    avatar:{
        public_ID:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
})

userSchema.methods.getResetPasswordToken = function(){
    //Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpires = Date.now() + 15*60*1000;

    return resetToken;
}

export default mongoose.model("User",userSchema);