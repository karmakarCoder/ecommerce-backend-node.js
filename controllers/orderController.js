import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
import Order from "../models/orderModel.js";
import sendStatusEmail from "../utils/statusEmail.js";
const router = express.Router();

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

    const order = await Order.create({
      user: {
        email: req.user.email,
        name: req.user.name,
      },
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

// payment status update
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.is_paid = true;
      order.paid_at = Date.now();
      order.status = "processing";
      order.payment_result = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
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

// order status update by admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    console.log(order);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = status;
    await order.save();

    // Email Notification
    try {
      await sendStatusEmail({
        email: order.user.email,
        name: order.user.name,
        orderId: order._id,
        status: status,
      });
    } catch (err) {
      console.error("Notification failed:", err.message);
    }

    res.json({
      message: `Order status updated to ${status}, notification sent to the user email`,
    });
  } catch (error) {
    next(error);
  }
};

// create stripe session  =========================================================
export const createStripeSession = async (req, res) => {
  const { order_id } = req.params;
  const order = await Order.findById(order_id).populate("order_items");

  if (!order) return res.status(404).json({ message: "Order not found" });

  const line_items = order.orderItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    // CRITICAL: metadata links this payment back to your MongoDB Order ID
    metadata: { order_id: order._id.toString() },
    success_url: `${process.env.FRONTEND_URL}/order/${order._id}?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/order/${order._id}?canceled=true`,
  });

  res.json({ id: session.id, url: session.url });
};

// webhook connect ==========================================================

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Successfully paid!
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata.order_id;

      try {
        const order = await Order.findById(order_id);
        if (order) {
          order.is_paid = true;
          order.paid_at = new Date();
          order.payment_result = {
            id: session.payment_intent,
            status: "succeeded",
            email_address: session.customer_details.email,
          };
          await order.save();
          console.log(`Order ${orderId} updated to PAID.`);
        }
      } catch (dbErr) {
        console.error("DB Update Error:", dbErr);
      }
    }

    res.status(200).json({ received: true });
  },
);
