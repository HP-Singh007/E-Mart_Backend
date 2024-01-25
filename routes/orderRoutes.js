import express from "express"
import { deleteOrder, getAllOrders, getAllUserOrders, getOrderDetails, newOrder, updateOrder } from "../controllers/orderController.js";
import {isAuthenticated, isAuthorized} from "../middlewares/auth.js"

const router = express.Router();

router.post("/new",isAuthenticated,newOrder);

router.route("/:id")
.get(isAuthenticated,getOrderDetails)
.put(isAuthenticated,isAuthorized,updateOrder)
.delete(isAuthenticated,isAuthorized,deleteOrder);

router.get("/me/all",isAuthenticated,getAllUserOrders);
router.get("/admin/all",isAuthenticated,isAuthorized,getAllOrders);

export default router;