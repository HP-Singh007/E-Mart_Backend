import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"
import ErrorHandler from "../middlewares/errorHandler.js"

//create a new order
export const newOrder = async(req,res,next)=>{
    try{
        const {shippingInfo,orderItems,paymentInfo,price} = req.body;

        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            price,
            paidAt:Date.now(),
            user:req.user.id
        })
    
        res.status(201).json({
            success:true,
            message:"Order Placed successfully",
            order
        })
    }
    catch(err){
        next(err);
    }
}

//get Single order details
export const getOrderDetails = async(req,res,next)=>{
    try{
        const order = await Order.findById(req.params.id).populate("user","name email");

        if(!order){
            return next(new ErrorHandler("No Order Found",404));
        }
    
        res.status(200).json({
            success:true,
            message:"Order Details loaded successfully",
            order
        })
    }catch(err){
        next(err);
    }
}

//get all orders placed by user
export const getAllUserOrders = async(req,res,next)=>{
    try {
        const orders = await Order.find({user:req.user.id});    //array of orders
        if(!orders){
            return next(new ErrorHandler("No Order Found",404));
        }

        res.status(200).json({
            success:true,
            message:`All orders placed by ${req.user.name}`,
            orders
        })

    } catch (error) {
        next(error);
    }
}

//get all orders -- Admin
export const getAllOrders = async(req,res,next)=>{
    const orders = await Order.find().populate("user","name email");

    let totalAmount = 0;
    orders.forEach(item => {
        totalAmount += item.price.totalPrice;
    });

    res.status(200).json({
        success:true,
        message:"List of all orders",
        totalAmount,
        orders
    })
}

//update Order status -- Admin
export const updateOrder = async(req,res,next)=>{
    try{
        const order = await Order.findById(req.params.id);

        if(!order){
            return next(new ErrorHandler("No Order Found",404));
        }
        
        order.orderStatus = req.body.orderStatus;
        
        if(order.orderStatus==="Shipped"){
            //update stock
            order.orderItems.forEach(async item=>{
            await updateStock(item.productId,item.quantity);  //defined below
            })
        }

        if(req.body.orderStatus === "Delivered"){
            order.deliveredAt = Date.now();
        }

        await order.save({validateBeforeSave:false});

        res.status(200).json({
            success:true,
            message:"Order status updated sucessfully"
        })

    }catch(err){
        next(err);
    }
}

async function updateStock(productId,quantity){
    const product = await Product.findById(productId);

    if(product){
        product.stock -= quantity;
    }
    await product.save({validateBeforeSave:false});
}

//delete Order 
export const deleteOrder = async(req,res,next)=>{
    try{
        const order = await Order.findById(req.params.id);
        
        if(!order){
            return next(new ErrorHandler("No order found",404));
        }
        
        await order.deleteOne();
    
    res.status(200).json({
            success:true,
            message:"Order Deleted Successfully"
        })
    }catch(err){
        next(err);
    }
}

