import express from "express"
import productRouter from "./routes/productRoute.js"
import userRouter from "./routes/userRoute.js"
import adminRouter from "./routes/adminRoute.js"
import orderRouter from "./routes/orderRoutes.js"
import paymentRouter from './routes/paymentRoute.js'
import { ErrorMiddleware } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import cors from 'cors'
import bodyParser from 'body-parser'
import fileUpload from "express-fileupload"

export const app = express();

//middlewares
app.use(express.json({limit:"50mb"}));        // for postman
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000",process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))

app.use(bodyParser.urlencoded({limit:"50mb",extended:true}));
app.use(fileUpload());

//config path
dotenv.config({path:"./data/config.env"});

//test case
app.get("/",(req,res)=>{
    res.send("Working");
})

//routes
app.use("/api/v1/products",productRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/admin/users",adminRouter);
app.use("/api/v1/orders",orderRouter);
app.use("/api/v1/payment",paymentRouter);

//error middleware
app.use(ErrorMiddleware);       