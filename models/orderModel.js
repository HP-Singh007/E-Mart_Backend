import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true
        },
        pinCode:{
            type:Number,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        phoneNo:{
            type:Number,
            required:true
        }
    },
    orderItems:[
        {
            productId:{
                type:mongoose.Schema.ObjectId,
                ref:"Product",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    paymentInfo:{
        id:{
            type:String,
            required:true
        },
        status:{
            type:String,
            required:true
        }
    },
    price:{
        itemPrice:{
            type:Number,
            default:0
        },
        tax:{
            type:Number,
            default:0
        },
        shippingCost:{
            type:Number,
            default:0
        },
        totalPrice:{
            type:Number,
            default:0
        }
    },
    orderStatus:{
        type:"String",
        default:"processing"
    },
    paidAt:{
        type:Date,
        required:true
    },
    deliveredAt:{
        type:Date
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

export default mongoose.model("Order",orderSchema);