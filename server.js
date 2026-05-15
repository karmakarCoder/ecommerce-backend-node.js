import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import mongoose from "mongoose";

// Connect to MongoDB
connectDB();
// mongoose.connection.on("open", async () => {
//   await mongoose.connection.db.collection("users").dropIndex("phone_1");
//   console.log("Old index dropped successfully");
// });

const app = express();

const __dirname = path.resolve();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/cart", cartRoutes);

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5055;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
