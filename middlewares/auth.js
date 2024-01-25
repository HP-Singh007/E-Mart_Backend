import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "./errorHandler.js";


export const isAuthenticated = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please Login First",401));
    }

    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodedToken.id)
    next();
}

export const isAuthorized = (req,res,next)=>{
    const user = req.user;
    if(user.role!=="Admin"){
        return next(new ErrorHandler(`role : ${user.role} is not allowed to access the resource`));
    }
    next();
}