import { Router } from "express";
import {
  getMyConversations,
  getConversationWithUser,
} from "../controllers/conversationController.js";
import { protect } from "../controllers/authController.js";

const router = Router();

router.use(protect);

router.get("/", getMyConversations);
router.get("/:userId", getConversationWithUser);

export default router;
