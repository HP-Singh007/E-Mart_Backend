import Product from "../models/productModel.js"
import ErrorHandler from "../middlewares/errorHandler.js"
import ApiFeatures from "../utils/apiFeatures.js";
import {v2 as cloudinary} from 'cloudinary'

//Create a new product -- ADMIN
export const newProduct = async (req,res,next)=>{
    try{    

        const images = [];

        for(let i=0;i<req.body.images.length;i++)
        {
            const result = await cloudinary.uploader.upload(req.body.images[i],{
                folder:"products"
            })
            images.push({
                public_id:result.public_id,
                url:result.secure_url
            })
        }

        req.body.images = images;           // assigning to req.body bcoz we are going to  
        req.body.createdBy = req.user.id;   // directly give it to create product
        const product = await Product.create(req.body);
        res.status(201).json({
            success:true,
            message:"New Product Added",
            product
        })
    }
    catch(err){
        next(err);
    }
}

//See all products
export const getAllProducts = async (req,res,next)=>{
    try{
        const resultPerPage = 12;
        const totalProducts = await Product.countDocuments();
        const apiFeature = new ApiFeatures(Product.find(),req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
        const product = await apiFeature.queryMethod;
        if(!product){return next(new ErrorHandler("No product found !",404))}

        res.status(200).json({
            success:true,
            message:"All products",
            totalProducts,
            product
        })
    }
    catch(err){
        next(err);
    }
};

//get top deals
export const topDeals = async(req,res,next)=>{
    try{
        const products = await Product.find().sort({discount:-1}).limit(3);

        res.status(200).json({
            success:true,
            message:"Top deals for today",
            products
        })
    }catch(err){
        next(err);
    }
}

//See all products --ADMIN
export const getAllProductsAdmin = async (req,res,next)=>{
    try{
        const totalProducts = await Product.countDocuments();
        const product = await Product.find();
        
        if(!product){return next(new ErrorHandler("No product found !",404))}

        res.status(200).json({
            success:true,
            message:"All products",
            totalProducts,
            product
        })
    }
    catch(err){
        next(err);
    }
};

//Update product details -- ADMIN
export const updateProduct = async (req,res,next)=>{
    try{
        let product = await Product.findById(req.params.id);
        if(!product){return next(new ErrorHandler("No product found !",500))}

        if(req.body.images.length){
            
           for (let i = 0; i < product.images.length; i++) {
               await cloudinary.uploader.destroy(product.images[i].public_id);
           }
            const images = [];

            for(let i=0;i<req.body.images.length;i++)
            {
                const result = await cloudinary.uploader.upload(req.body.images[i],{
                    folder:"products"
                })
                images.push({
                    public_id:result.public_id,
                    url:result.secure_url
                })
            }

            req.body.images = images;
        }
        else{
            req.body.images = product.images;
        }
        
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false})

        res.status(200).json({
            success:true,
            message:"Product updated",
            product
        })
    }
    catch(err){
        next(err);
    }
}

//Delete a product -- ADMIN
export const deleteProduct = async (req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){return next(new ErrorHandler("No product found !",500))}

        //deleting from cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.uploader.destroy(product.images[i].public_id);
        }

        await product.deleteOne();
        res.status(200).json({
            success:true,
            message:`${product.name} deleted`
        })
    }
    catch(err){
        next(err);
    }
}

//get a product details(single)
export const getProductDetails = async (req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){return next(new ErrorHandler("Error loading product details",500))}
       
        res.status(200).json({
            success:true,
            message:"product details",
            product
        })
    }
    catch(err){
        next(err);
    }
}

//create review
export const createReview = async (req,res,next)=>{
    try {
        const product = await Product.findById(req.params.id);

        if(!product){
            return next(new ErrorHandler("No product found",404));
        }

        const {rating,comment} = req.body;

        const review = {
            user:req.user.id,
            name:req.user.name,
            rating:Number(rating),
            comment
        }

        let alreadyReviewed = false;

        product.reviews.forEach(item=>{
            if(item.user.toString() === req.user.id){
                //logged in user has already given a review, so update it
                alreadyReviewed = true;
                item.rating = rating;
                item.comment = comment;
            }
        })

        if(!alreadyReviewed){
            product.reviews.push(review);
        }

        //update number of reviews
        const totalReviews = product.reviews.length;
        product.numOfReviews = totalReviews;
        
        //update general rating of the product
        let sum = 0;
        product.reviews.forEach(item=>{
            sum += item.rating;
        })
        product.rating = sum/totalReviews;

        await product.save({validateBeforeSave:false});

        res.status(200).json({
            success:true,
            message:"Review added successfully"
        })
    } catch (err) {
        next(err);
    }
}

//delete review
export const deleteReview = async(req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return next(new ErrorHandler("No product found",404));
        }

        product.reviews.forEach(item=>{
            if((item._id.toString() === req.query.reviewId) && (item.user.toString() === req.user.id)){
                item.deleteOne();
            }
        })

        //update number of reviews
        const totalReviews = product.reviews.length;
        product.numOfReviews = totalReviews;
        
        //update general rating of the product
        let sum = 0;
        product.reviews.forEach(item=>{
            sum += item.rating;
        })
        product.rating = sum/totalReviews;

        await product.save({validateBeforeSave:false});

        res.status(200).json({
            success:true,
            message:"Review deleted successfully"
        })
    }catch(err){
        next(err);
    }
}

//get all reviews
export const getAllReviews = async(req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id).populate({
            path:'reviews',
            populate:{
                path:'user',
                model:'User',
                select:'avatar'
            }
        });
        if(!product){
            return next(new ErrorHandler("No product found",404));
        }

        res.status(200).json({
            success:true,
            message:`All reviews for ${product.name}`,
            reviews:product.reviews
        })

    }catch(err){
        next(err);
    }
}