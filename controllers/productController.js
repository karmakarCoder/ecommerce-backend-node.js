import Product from "../models/productModel.js";

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
  const { name, price, description, category, countInStock, id } = req.body;

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
      countInStock,
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
  const { name, price, description, category, countInStock } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    if (price !== undefined && price !== "") {
      product.price = Number(price);
    }

    if (countInStock !== undefined && countInStock !== "") {
      product.countInStock = Number(countInStock);
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
