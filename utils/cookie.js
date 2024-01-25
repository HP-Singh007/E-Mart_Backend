import jwt from "jsonwebtoken"

export const setCookie = (user,res,message,code=200)=>{
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET);
    res.status(code).cookie("token",token,{
        httpOnly:true,
        maxAge:2*24*60*60*1000,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
    }).json({
        success:true,
        message
    })
}

export const removeCookie = (res,message,code=200)=>{
    res.status(code).cookie("token","",{
        maxAge:0,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
    }).json({
        success:true,
        message
    })
}