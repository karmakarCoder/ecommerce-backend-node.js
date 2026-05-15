import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendBanEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

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

// Register user (Public)
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  let image = "";
  if (req.file) {
    image = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      image,
      role: "user",
    });
    res.status(201).json({
      message: "Your account is created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: "user",
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.is_banned && user.ban_expires > Date.now()) {
        res.status(403).json({
          message: `Your account is banned until ${user.ban_expires.toLocaleString()}`,
          status: false,
        });
      }

      // If ban expired, lift it automatically
      if (user.isBanned && user.banExpires < Date.now()) {
        user.is_banned = false;
        user.ban_expires = null;
        await user.save();
      }

      res.json({
        message: "You are successfuly logged in",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          token: generateToken(user._id),
          expire_in: "30d",
        },
      });
    } else {
      res.status(401).json({
        message: "Your email and password does not match in our records",
        status: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get user profile (Private)
export const getUserProfile = async (req, res) => {
  res.json(req.user);
};

// update user
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.image = req.body.image || user.image;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(201).json({
        message: "User information updated successfully",
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          is_admin: updatedUser.is_admin,
          is_banned: updatedUser.is_banned,
          image: updatedUser.image,
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    if (typeof next === "function") {
      next(error);
    } else {
      console.error("Next was not defined:", error);
      res.status(500).json({ message: error.message });
    }
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.is_admin) {
        res.status(400).json({
          message: "Cannot delete an admin user",
          status: false,
        });
        return;
      }
      await User.deleteOne({ _id: user._id });
      res.status(201).json({
        message: "User removed successfully, you can't restore this user",
        deleted_id: user._id,
      });
    } else {
      res.status(404).json({
        message: "User not found, try again",
      });
    }
  } catch (error) {
    next(error);
  }
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

// create admin
export const createAdminAccount = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already taken" });

    if (!["admin", "super_admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid admin role" });
    }

    const admin = await User.create({ name, email, password, role });
    res.status(201).json({ message: `${role} created successfully`, admin });
  } catch (error) {
    next(error);
  }
};
