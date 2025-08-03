import { Router } from "express";
import { sendMessage, getMessage } from "../controllers/messageController.js";
import { protect } from "../controllers/authController.js";
const router = Router();
router.use(protect);

router.route("/:receiverId").post(sendMessage).get(getMessage);

export default router;
