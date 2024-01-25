import express from "express"
import {isAuthenticated,isAuthorized} from "../middlewares/auth.js"
import { dashboard, deleteUser, getAllUsers, getSingleUser, updateUserRole } from "../controllers/adminController.js";
import { getAllProductsAdmin } from "../controllers/productController.js";

const router = express.Router();

router.get("/all",isAuthenticated,isAuthorized,getAllUsers);
router.get("/products/all",isAuthenticated,isAuthorized,getAllProductsAdmin);
router.get("/dashboard",isAuthenticated,isAuthorized,dashboard);

router.route("/:id")
.get(isAuthenticated,isAuthorized,getSingleUser)
.put(isAuthenticated,isAuthorized,updateUserRole)
.delete(isAuthenticated,isAuthorized,deleteUser);

export default router;
