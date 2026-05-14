import express from "express";
import {
  authUser,
  registerUser,
  getUserProfile,
  getUsers,
  updateUser,
  deleteUser,
  banUser,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/users", protect, admin, getUsers);
router.put("/users/:id", protect, admin, upload.single("image"), updateUser);
router.delete("/users/:id", protect, admin, deleteUser);
router.post("/users/:id/ban", protect, admin, upload.none(), banUser);

router.post("/signup", upload.single("image"), registerUser);
router.post("/login", upload.none(), authUser);
router.get("/profile", protect, getUserProfile);

export default router;
