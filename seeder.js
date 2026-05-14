import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";

dotenv.config();

const importData = async () => {
  try {
    // 1. Wait for the database connection first
    await connectDB();

    console.log("Clearing old users...");
    await User.deleteMany();

    console.log("Creating Admin...");
    await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: "12345678",
      role: "super_admin",
    });

    console.log("--- Admin User Created Successfully! ---");
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

// Start the process
importData();
