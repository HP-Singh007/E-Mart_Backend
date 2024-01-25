import express from "express"
import { changePassword, forgetPassword, getUserDetails, login, logout, register, resetPassword, sendOtp, updateUserDetails, verifyOtp } from "../controllers/userController.js";
import {isAuthenticated} from "../middlewares/auth.js"

const router = express.Router();

router.post("/sendotp",sendOtp);
router.post("/verifyotp",verifyOtp);
router.post("/register",register);
router.post("/login",login);
router.get("/logout",logout);
router.get("/me",isAuthenticated,getUserDetails);
router.put("/me/update",isAuthenticated,updateUserDetails);
router.put("/password/change",isAuthenticated,changePassword);
router.post("/password/reset",forgetPassword);
router.put("/password/reset/:token",resetPassword);

export default router;