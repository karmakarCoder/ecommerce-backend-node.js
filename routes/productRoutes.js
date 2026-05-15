import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  replyToReview,
} from "../controllers/productController.js";
import upload from "../middleware/uploadMiddleware.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes for base endpoint
router.route("/").get(getProducts);

router.post("/:id/reviews", protect, upload.single(), createProductReview);

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

router.post(
  "/:product_id/reviews/:review_id/reply",
  protect,
  admin,
  upload.single(),
  replyToReview,
);

// Routes for specific IDs
router
  .route("/:id")
  .get(getProductById)
  .put(upload.single("image"), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
