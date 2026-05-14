import mongoose from "mongoose";

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
    description: {
      type: String,
      required: [true, "Please add a product description"],
    },
    category: {
      type: String,
      required: [true, "Please add a product category"],
    },
    countInStock: {
      type: Number,
      required: [true, "Please add stock count"],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
