//now we have built-in class 'Error' but it has only message property no status code, so we make our own custom class that will have all functions of Error class and along with it a Status code property too

class ErrorHandler extends Error{
    constructor(message,statusCode){    // whenever a new object made pass msg and code
        super(message);                 //pass message to parent class
        this.statusCode = statusCode;   //give statusCode to this class
    }
}
//so whenever a new error is made using this class, we will have message and statusCode property in the error

//now we create a middleware that will handle errors
export const ErrorMiddleware = (err,req,res,next)=>{
    const msg = err.message || "Internal Server Error";     //the error got will be am object of 
    const code = err.statusCode || 500;                     //ErrorHandler class so have message
    res.status(code).json({                                 //and statusCode property
        success:false,
        message:msg
    })
}

export default ErrorHandler;