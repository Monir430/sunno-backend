const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB ডাটাবেস কানেকশন
const mongoURI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Database Connected Successfully!'))
  .catch(err => console.log('DB Connection Error:', err));

// --- 1. PRODUCT SCHEMA ---
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number,
  image: String
});
const Product = mongoose.model('Product', productSchema);

// --- 2. ORDER SCHEMA ---
const orderSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  address: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- API ROUTES ---

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json({ message: 'Product Added Successfully!', product: newProduct });
});

app.post('/api/orders', async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  
  for (let item of req.body.items) {
    await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.qty } });
  }

  res.json({ success: true, message: 'Order Placed!', orderId: newOrder._id });
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
