import User from "../models/userModel.js";
import sendBanEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";

// user list
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(201).json({
      message: "User list data retrive successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// user details
export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid User ID format");
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json({
      message: "User details retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile (Private)
export const getUserProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    data: req.user,
  });
};

// Temporary ban user
export const banUser = async (req, res, next) => {
  const { duration, reason } = req.body; // e.g., 7 for a week
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.is_banned = true;
      user.ban_expires = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
      await user.save();
      try {
        await sendBanEmail({
          email: user.email,
          name: user.name,
          expiry: duration,
          reason: reason,
        });
        console.log("email send it");
      } catch (emailError) {
        console.error("Email failed to send, but user was banned:", emailError);
        // We don't throw an error here so the API response still succeeds
      }
      res
        .status(201)
        .json({ message: `User banned for ${duration} days`, reason: reason });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};
