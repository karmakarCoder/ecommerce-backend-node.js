import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import upload from "../middleware/uploadMiddleware.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes for base endpoint
router.route("/").get(getProducts);

// create product
router.post("/", protect, admin, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        timestamp: Date.now(),
      });
    }
    createProduct(req, res, next);
  });
});

// Routes for specific IDs
router
  .route("/:id")
  .get(getProductById)
  .put(upload.single("image"), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
