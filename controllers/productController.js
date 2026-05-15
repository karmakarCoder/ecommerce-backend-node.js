import Product from "../models/productModel.js";
import sendReplyEmail from "../utils/sendReplyEmail.js";

// get all products
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.status(201).json({
      message: "Product data retrive successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// get invidual product
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.status(201).json({
      message: "Product details data retrive successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// create product
export const createProduct = async (req, res, next) => {
  const { name, price, description, category, stock, id } = req.body;

  const fileName = req.file.path.replace(/\\/g, "/");

  // 2. Build Full URL
  const fullUrl = `${req.protocol}://${req.get("host")}/${fileName}`;

  try {
    const product = await Product.create({
      id: id,
      name,
      price,
      description,
      category,
      stock,
      rating,
      discount,
      image: fullUrl,
    });

    res.status(201).json({
      message: "product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// update product
export const updateProduct = async (req, res, next) => {
  const { name, price, description, category, stock, rating, discount } =
    req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.rating = rating || product.rating;
    product.discount = discount || product.discount;
    if (price !== undefined && price !== "") {
      product.price = Number(price);
    }

    if (stock !== undefined && stock !== "") {
      product.stock = Number(stock);
    }

    if (req.file) {
      product.image = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await product.deleteOne();
    res.status(201).json({
      message: "Your product is deleted by permanently",
    });
  } catch (error) {
    next(error);
  }
};

// product review for user

export const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      name: req.user.name,
      email: req.user.email,
      rating: Number(rating),
      comment,
      user: req.user.id,
    };

    product.reviews.push(review);
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res
      .status(201)
      .json({ message: `Review added to product #${req.params.id}` });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
};

// admin reply of the review

export const replyToReview = async (req, res, next) => {
  const { reply } = req.body;
  const product = await Product.findById(req.params.product_id).populate(
    "reviews.user",
    "name email",
  );

  if (product) {
    const review = product.reviews.id(req.params.review_id);
    if (review) {
      review.admin_reply = reply;
      review.replied_at = Date.now();
      await product.save();

      // Trigger Email Notification
      try {
        await sendReplyEmail({
          email: review.user.email,
          name: review.user.name,
          productName: product.name,
          reply: reply,
        });
      } catch (err) {
        console.error("Email failed:", err.message);
      }

      res.status(200).json({ message: "Reply added and email sent" });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
