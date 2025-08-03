import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../controllers/authController.js";
const router = Router();

router.route("/me").post(protect, updateMe).delete(protect, deleteMe); // Get current user

router
  .route("/")
  .get(protect, getAllUsers)
  .post(protect, restrictTo("admin"), createUser);
router
  .route("/:id")
  .get(getUser)
  .patch(protect, restrictTo("admin"), updateUser)
  .delete(protect, restrictTo("admin"), deleteUser);

export default router;
