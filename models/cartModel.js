import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", select: false }, // Hides user by default
    carts: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        description: String,
        price: Number,
        quantity: Number,
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
