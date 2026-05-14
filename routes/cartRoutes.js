import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getCart).post(upload.none(), addToCart);

router.route("/:id").delete(removeFromCart);

export default router;
