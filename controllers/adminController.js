import ErrorHandler from "../middlewares/errorHandler.js";
import User from "../models/userModel.js"
import Product from "../models/productModel.js"
import Order from '../models/orderModel.js'
import {v2 as cloudinary} from 'cloudinary'

export const getAllUsers = async (req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        message:"List of all users registered",
        users
    })
}

export const getSingleUser = async(req,res,next)=>{
    try {
        const user = await User.findById(req.params.id);

        if(!user){
            return next(new ErrorHandler("No User found",404));
        }

        res.status(200).json({
            success:true,
            message:`Details for user : ${user.name}`,
            user
        })
    } catch (err) {
        next(err);
    }
}

export const updateUserRole = async(req,res,next)=>{
    try{
        let user = await User.findById(req.params.id);

        if(!user){return next(new ErrorHandler("No user found",404))}

        user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false})
        res.status(200).json({
            success:true,
            message:`Profile of ${user.name} Updated successfully`
        })
    }
    catch(err){
        next(err);
    }
}

export const deleteUser = async(req,res,next)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user){
            return next(new ErrorHandler("No user found",404));
        }

        cloudinary.uploader.destroy(user.avatar.url);

        await user.deleteOne();
        res.status(200).json({
            success:true,
            message:`User : ${user.name} deleted successfully`
        })
    }catch(err){
        next(err);
    }
}

//dashboard
export const dashboard = async(req,res,next)=>{
    try{

        const activeUsers = await User.countDocuments();
        const products = await Product.countDocuments();

        const outOfStock = await Product.find({stock:0}).countDocuments();

        let totalEarning=0;
        const allOrders = await Order.find();

        allOrders.forEach((item)=>{
            totalEarning+=item.price.totalPrice;
        })

        const currMonth = new Date(Date.now()).getMonth();
        let monthlySales=[];

        let monthWiseEarning=[];
        for(let i=0;i<12;i++){
            let earning = 0;
            const data = await Order.find({ $expr: { $eq: [{ $month: "$createdAt" }, i+1] } });
            data.forEach((item)=>{
                earning += item.price.totalPrice;
            })
            monthWiseEarning[i]=earning;

            if(i===currMonth){
                monthlySales = data;
            }
        }

        const monthEarning = monthWiseEarning[currMonth];        

        res.status(200).json({
            success:true,
            message:"Dashboard data",
            activeUsers,
            products,
            totalEarning,
            monthEarning,
            monthlySales,
            monthWiseEarning,
            outOfStock
        })
    }
    catch(err){
        next(err);
    }
}