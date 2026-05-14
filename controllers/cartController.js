import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// Add item to cart or Update quantity
export const addToCart = async (req, res, next) => {
  const { product: productId, quantity } = req.body;

  try {
    // 1. Get the actual product data from the database
    const productData = await Product.findById(productId);
    if (!productData) {
      res.status(404);
      throw new Error("Product not found");
    }

    const userId = req.user?.id || req.user?._id;

    // 2. Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const itemIndex = cart.carts.findIndex(
        (p) => p.product_id.toString() === productId,
      );

      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += Number(quantity);
      } else {
        cart.carts.push({
          product_id: productId,
          name: productData.name,
          image: productData.image,
          description: productData.description,
          price: productData.price,
          quantity: Number(quantity),
        });
      }
      cart = await cart.save();
      return res.status(200).json({ message: "Cart updated", data: cart });
    } else {
      // 5. Create a brand new cart
      const newCart = await Cart.create({
        user: userId,
        carts: [
          {
            product_id: productId,
            name: productData.name,
            image: productData.image,
            description: productData.description,
            price: productData.price,
            quantity: Number(quantity),
          },
        ],
      });
      return res.status(201).json({ message: "Cart created", data: newCart });
    }
  } catch (error) {
    next(error);
  }
};

// user cart list
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const cart = await Cart.findOne({ user: userId })
      .select("-user -__v -_id -createdAt -updatedAt")
      .lean();

    if (cart && cart.carts) {
      cart.carts = cart.carts.map(({ _id, ...rest }) => rest);
    }

    res.status(200).json({
      message: "cart list data retrieved successfully",
      data: cart ? cart.carts : [],
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.carts = cart.carts.filter(
        (item) => item.product_id.toString() !== req.params.id,
      );
      await cart.save();
      res.json({ message: "Item removed", data: cart });
    } else {
      res.status(404);
      throw new Error("Cart not found");
    }
  } catch (error) {
    next(error);
  }
};
