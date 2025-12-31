const Product = require("../model/productModel");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
module.exports = {
  // Get all products
  getProducts: async (req, res) => {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get single product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a product (Admin logic)
  createProduct: async (req, res) => {
    try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });
    const result = await streamUpload(req.file.buffer);

    // 2. Create the product using your existing Model
  const newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    category: req.body.category,
    countInStock: Number(req.body.countInStock),
    isFeatured: req.body.isFeatured === "true",
    image: result.secure_url,
    imagePublicId: result.public_id
});

    // 3. Save to MongoDB Atlas
    const savedProduct = await newProduct.save();
    
    res.status(201).json(savedProduct);
    } catch (error) {
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  },
  updateProduct: async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔁 If new image uploaded
    if (req.file) {
      // Delete old image
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }

      // Upload new image
      const result = await streamUpload(req.file.buffer);
      product.image = result.secure_url;
      product.imagePublicId = result.public_id;
    }

    // 🔁 Update fields safely
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.category) product.category = req.body.category;

    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }

    if (req.body.countInStock !== undefined) {
      product.countInStock = Number(req.body.countInStock);
    }

    if (req.body.isFeatured !== undefined) {
      product.isFeatured = req.body.isFeatured === "true";
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Product update failed",
      error: error.message
    });
  }
}

}