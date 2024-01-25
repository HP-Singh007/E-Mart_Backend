import express from "express"
import { createReview, deleteProduct, deleteReview, getAllProducts, getAllReviews, getProductDetails, newProduct, topDeals, updateProduct } from "../controllers/productController.js";
import {isAuthenticated, isAuthorized} from "../middlewares/auth.js"

const router = express.Router();

router.get("/",getAllProducts);
router.get("/top",topDeals);
router.post("/new",isAuthenticated,isAuthorized,newProduct);

router.route("/:id")
.put(isAuthenticated,isAuthorized,updateProduct)
.delete(isAuthenticated,isAuthorized,deleteProduct)
.get(getProductDetails);

router.route("/review/:id")
.put(isAuthenticated,createReview)
.delete(isAuthenticated,deleteReview)
.get(getAllReviews);

export default router;