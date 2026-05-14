import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    order_items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shipping_address: {
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    payment_method: { type: String, default: "Stripe" },
    payment_result: {
      id: { type: String },
      status: { type: String },
    },
    total_price: { type: Number, required: true, default: 0.0 },
    is_paid: { type: Boolean, required: true, default: false },
    paid_at: { type: Date },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
