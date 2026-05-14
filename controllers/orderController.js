import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
import Order from "../models/orderModel.js";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("FATAL ERROR: STRIPE_SECRET_KEY is not defined in .env");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// checkout
export const checkout = async (req, res, next) => {
  const { order_items, shipping_address } = req.body;

  try {
    if (!order_items || order_items.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }
    const totalPrice = order_items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // 2. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
      metadata: { userId: req.user._id.toString() },
    });

    // 3. Create Order in DB (Status: Unpaid)
    const order = await Order.create({
      user: req.user._id,
      order_items: order_items,
      shipping_address,
      total_price: totalPrice,
      payment_result: { id: paymentIntent.id, status: "pending" },
    });

    // 4. Send client_secret to Frontend
    res.status(201).json({
      message: "You client secret is generated for payment confirmation",
      client_secret: paymentIntent.client_secret,
      order_id: order._id,
    });
  } catch (error) {
    next(error);
  }
};

// order list

export const getOrder = async (req, res, next) => {
  try {
    const orders = await Order.find({});
    res.status(201).json({
      message: "Order data retrive successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
