import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    admin_reply: { type: String },
    replied_at: { type: Date },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Please add a product image file"],
    },
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a product price"],
      default: 0.0,
    },
    discount: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      required: [true, "Please add a product description"],
    },
    category: {
      type: String,
      required: [true, "Please add a product category"],
    },
    stock: {
      type: Number,
      required: [true, "Please add stock count"],
      default: 0,
    },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
