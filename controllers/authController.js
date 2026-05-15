import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendOtpEmail from "../utils/otpEmail.js";

// generate the token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Login user
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.is_verified) {
        return res
          .status(401)
          .json({ message: "Please verify your email first" });
      }
      if (user.is_banned && user.ban_expires > Date.now()) {
        res.status(403).json({
          message: `Your account is banned until ${user.ban_expires.toLocaleString()}`,
          status: false,
        });
      }

      // If ban expired, lift it automatically
      if (user.is_banned && user.ban_expires < Date.now()) {
        user.is_banned = false;
        user.ban_expires = null;
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          },
          token: generateToken(user._id),
          expires_in: "30d",
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "UNAUTHORIZED_ACCESS",
      });
    }
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
      res.status(400).json({
        message: "User already exists",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      image,
      otp,
      otp_expiry,
      is_verified: false,
      role: "user",
    });

    try {
      await sendOtpEmail({ email, name, otp, otp_expiry });
      res.status(201).json({
        message:
          "Registration successful. Please check your email for the 6-digit OTP.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: "user",
        },
        success: true,
      });
    } catch (error) {
      res.status(500).json({ message: "Error sending email" });
    }
  } catch (error) {
    next(error);
  }
};

// otp verify

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isVerified)
    return res.status(400).json({ message: "User already verified" });

  // Check if OTP matches and hasn't expired
  if (user.otp === otp && user.otp_expiry > Date.now()) {
    user.is_verified = true;

    await user.save();

    res.status(200).json({
      message: "Account verified successfully. You can now login.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: "user",
        },
        token: generateToken(user._id),
      },
      success: true,
    });
  } else {
    res.status(400).json({ message: "Invalid or expired OTP" });
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
      res.status(404).json({
        message: "User not found",
      });
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
