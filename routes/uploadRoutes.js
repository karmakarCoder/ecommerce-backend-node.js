import express from "express";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 'image' must match the key name sent from the frontend FormData
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  // Return the path where the file is hosted on your server
  res.status(200).send({
    message: "Image uploaded successfully",
    imagePath: `/${req.file.path.replace(/\\/g, "/")}`,
  });
});

export default router;
