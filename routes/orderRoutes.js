import express from "express";

import { admin, protect, superAdmin } from "../middleware/authMiddleware.js";
import {
  checkout,
  getOrder,
  updateOrderStatus,
  updateOrderToPaid,
} from "../controllers/orderController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/", protect, admin, getOrder);

// User: Update payment status upon success
router.put("/:id/pay", protect, updateOrderToPaid);

// Admin: Update general status or cancel
router.put(
  "/:id/status",
  protect,
  superAdmin,
  upload.single(),
  updateOrderStatus,
);

export default router;
