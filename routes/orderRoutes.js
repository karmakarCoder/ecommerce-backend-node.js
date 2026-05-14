import express from "express";

import { admin, protect } from "../middleware/authMiddleware.js";
import { checkout, getOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/", protect, admin, getOrder);

export default router;
