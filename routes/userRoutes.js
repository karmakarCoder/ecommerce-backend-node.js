import express from "express";
import {
  getUserProfile,
  getUsers,
  banUser,
  getUserDetails,
} from "../controllers/userController.js";
import { admin, protect, superAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  authUser,
  createAdminAccount,
  deleteUser,
  registerUser,
  updateUser,
  verifyOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/users", protect, admin, superAdmin, getUsers);
router.put("/users/:id", protect, upload.single("image"), updateUser);
router.delete("/users/:id", protect, admin, superAdmin, deleteUser);
router.get("/users/:id", protect, admin, superAdmin, getUserDetails);
router.post("/users/:id/ban", protect, admin, upload.none(), banUser);

router.post(
  "/admin/create",
  protect,
  superAdmin,
  upload.none(),
  createAdminAccount,
);
router.post("/signup", upload.single("image"), registerUser);
router.post("/login", upload.none(), authUser);
router.post("/verify", upload.single(), verifyOTP);
router.get("/profile", protect, getUserProfile);

export default router;
