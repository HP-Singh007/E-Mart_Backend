import ErrorHandler from "../middlewares/errorHandler.js"
import User from "../models/userModel.js"
import Otp from "../models/otpModel.js"
import bcrypt from "bcryptjs"
import {removeCookie, setCookie} from "../utils/cookie.js"
import { sendEmail } from "../utils/mail.js"
import crypto from "crypto"
import {v2 as cloudinary} from "cloudinary";

//send otp
export const sendOtp = async(req,res,next)=>{
    try{
        const {email} = req.body;

        //User already exists
        let user = await User.findOne({email});
        if(user){return next(new ErrorHandler("User Already Exists",400))};
    
        //generate otp
        let otp = crypto.randomBytes(2).toString("hex");
    
        const message = `Your One Time Password for profile verificaton is \n\n ${otp}\n\nIf the request is not made by you then just ignore it.\n\nThanks`;
        
        sendEmail({
            email,
            subject:"Ecommerce website OTP Verification",
            message
        })
    
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        
        //if user already exists in otp
        const otpObject = await Otp.findOne({email});

        if(otpObject){
            otpObject.otp = hashedOtp;
            otpObject.otpExpires = Date.now()+5*60*1000;
            await otpObject.save({validateBeforeSave:false})
        }
        else{
            await Otp.create({
                otp:hashedOtp,
                otpExpires:Date.now()+5*60*1000,
                email
            })
        }

        res.status(201).json({
            success:true,
            message:`Otp send successfully to ${email}`
        })
    }catch(err){
        next(err);
    }
}

//verfiy otp
export const verifyOtp = async(req,res,next)=>{
    try{
        const {email,otp} = req.body;
        const otpObject = await Otp.findOne({email:email,otpExpires:{$gt:Date.now()}});

        if(!otpObject){
            return next(new ErrorHandler("Otp verification failed",404));
        }

        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        if(hashedOtp !== otpObject.otp){
            return next(new ErrorHandler("Otp verification failed",400))
        }

        otpObject.isVerified = true;
        otpObject.otp = undefined;
        otpObject.otpExpires = undefined;
        otpObject.save({validateBeforeSave:false});
        res.status(200).json({
            success:true,
            message:"email verified successfully"
        })

    }catch(err){
        next(err);
    }
}

//register User
export const register = async (req,res,next)=>{
    try{

        const {name,email,password} = req.body;

        //User already exists
        let user = await User.findOne({email});
        if(user){return next(new ErrorHandler("User Already Exists",400))};

        //is verified
        const verify = await Otp.findOne({email:email,isVerified:true});

        if(!verify){
            return next(new ErrorHandler("Please verify the mail first",400));
        }

        //hashing password
        const hashedPassword = await bcrypt.hash(password,10);  
        
        //saving to cloudinary
        const myCloud = await cloudinary.uploader.upload(req.body.avatar,{
            folder:"avatars",
            width:150,
            crop:"scale"
        })

        const avatar = {
            public_ID:myCloud.public_id,
            url:myCloud.secure_url
        }

        //Creating user
        user = await User.create({
            name,
            email,
            password:hashedPassword,
            avatar,
        })

        if(!user){
            return next(new ErrorHandler("User Registration Failed",500));
        }

        setCookie(user,res,"User registered successfully",200)
    }
    catch(err){
        next(err);
    }
}

//login
export const login = async(req,res,next)=>{
    try{
        const {email,password} = req.body;

        let user = await User.findOne({email}).select("+password");
        if(!user){                          
            return next(new ErrorHandler("Incorrect Email or Password",400));        //user check
        }

        const isMatch = await bcrypt.compare(password,user.password);   //password check
        if(isMatch){
            setCookie(user,res,`Welcome ${user.name}`,200)
        }
        else{
            return next(new ErrorHandler("Incorrect Email or Password",400));
        }
    }
    catch(err){
        next(err);
    }
}

//Logout
export const logout = (req,res,next)=>{
    try{
        removeCookie(res,"Logged out successfully",200)
    }
    catch(err){
        next(err);
    }
}

//forget password
export const forgetPassword = async(req,res,next)=>{
    //get email id from user
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        return next(new ErrorHandler("User not found",400));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    const resetUrl = `${process.env.FRONTEND_URL}/${process.env.BASE_URL}/users/password/reset/${resetToken}`;
    const message = `Your password reset token is \n\n ${resetUrl} \n\n If you haven't requested this then just ignore it`;

    try {
        await sendEmail({
            email:user.email,
            subject:"Ecommerce password recovery",
            message
        })
        res.status(200).json({
            success:true,
            message:`Email sent successfully to ${user.email}`
        })
    }catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({validateBeforeSave:false})
        next(err);
    }
}

//reset password
export const resetPassword = async(req,res,next)=>{
    try {
        //before comparing with database, hash the given token
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        //compare with database
        let user = await User.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordExpires:{$gt:Date.now()}
        });

        if(!user){
            return next(new ErrorHandler("Token Invalid or expired",400));
        }

        if(req.body.password !== req.body.confirmPassword){
            return next(new ErrorHandler("Passwords dont match",400))
        }

        const hashedPassword = await bcrypt.hash(req.body.password,10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({validateBeforeSave:false})
        
        res.status(200).json({
            success:true,
            message:"Password Updated Successfully",
        })
    } catch (err) {
        next(err);
    }


}

//get user details
export const getUserDetails = (req,res,next)=>{
    res.status(200).json(req.user);
}

//change password
export const changePassword = async(req,res,next)=>{
    try{
        const {oldPass, newPass, confirmPass} = req.body;

        const user = await User.findById(req.user.id).select("+password");

        const isMatch = await bcrypt.compare(oldPass,user.password);
        console.log(isMatch);
        if(!isMatch){
            return next(new ErrorHandler("Invalid Password",400));
        }
        if(newPass !== confirmPass){
            return next(new ErrorHandler("Passwords dont match",400));
        }
        if(newPass===''){
            return next(new ErrorHandler("Please Enter a password",400));
        }

        const hashedPassword =await bcrypt.hash(newPass,10);
        user.password = hashedPassword;
        await user.save({validateBeforeSave:false})
        res.status(200).json({
            success:true,
            message:"Password updated successfully"
        })
    }
    catch(err){
        next(err);
    }
}

//update user details
export const updateUserDetails = async(req,res,next)=>{
    try{       
       const {name,email} = req.body;
       let avatar;

       if(req.body.avatar.length){
            //deleting old from cloudinary
            await cloudinary.uploader.destroy(req.user.avatar.public_ID);

            //saving to cloudinary
            const myCloud = await cloudinary.uploader.upload(req.body.avatar,{
                folder:"avatars",
                width:150,
                crop:"scale"
            })            
    
            avatar = {
                public_ID:myCloud.public_id,
                url:myCloud.secure_url
            }
       }
       else{
            avatar = req.user.avatar;
       }

        const newObj={
            name,
            email,
            avatar
        }

        await User.findByIdAndUpdate(req.user.id,newObj,{new:true,runValidators:true,useFindAndModify:false})
        res.status(200).json({
            success:true,
            message:"Profile Updated successfully"
        })
    }
    catch(err){
        next(err);
    }
}