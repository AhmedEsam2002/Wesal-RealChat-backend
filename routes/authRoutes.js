import { Router } from "express";
import {
  signup,
  login,
  forgetPassword,
  resetPassword,
  updatePassword,
  protect,
  //   logout,
} from "../controllers/authController.js";
const router = Router();

// Authentication Routes
router.post("/signup", signup);
router.post("/login", login);
// router.post("/logout", logout);

// Password Reset Routes
router.post("/forget-password", forgetPassword);
router.patch("/reset-password/:token", resetPassword);

// Update password (requires authentication)
router.patch("/update-password", protect, updatePassword);

export default router;
