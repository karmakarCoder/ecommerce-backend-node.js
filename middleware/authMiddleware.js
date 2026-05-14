import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object (minus the password)
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({
        message: "Token is expired, please login again",
        success: false,
      });
    }
  } else {
    res.status(401).json({
      message: "Token is expired, please login again",
      success: false,
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(401).json({
      message: "Admin only access this route",
    });
  }
};
