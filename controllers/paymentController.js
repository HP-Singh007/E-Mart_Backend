import Stripe from 'stripe';

export const processPayment = async(req,res,next)=>{
    try{
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const {amount,name,shippingInfo} = req.body;
        const myPayment = await stripe.paymentIntents.create({
            amount:amount,
            currency:'inr',
            description:"E-commerce Service",
            metadata:{
                company:"E-Mart"
            },
            shipping: {
                name: name,
                address: {
                  line1: shippingInfo.address,
                  postal_code: shippingInfo.pin,
                  city: shippingInfo.city,
                  state: shippingInfo.state,
                  country: shippingInfo.country,
                }
              },
        })

        res.status(200).json({
            success:true,
            client_secret:myPayment.client_secret,
            myPayment
        })

    }catch(err){
        next(err);
    }
}

export const sendApiKey=(req,res,next)=>{
    res.status(200).json({
        success:true,
        api_key:process.env.STRIPE_API_KEY
    })
}