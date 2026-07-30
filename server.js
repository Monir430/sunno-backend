const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB কানেকশন স্ট্রিং
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://mdmonirkhan43000_db_user:j6pIQCZRddpHl0NU@cluster0.khyj9l0.mongodb.net/sunno_store?retryWrites=true&w=majority';


mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Database Connected Successfully!'))
  .catch(err => console.log('DB Connection Error:', err));

// --- PRODUCT SCHEMA ---
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number,
  image: String
});
const Product = mongoose.model('Product', productSchema);

// --- ORDER SCHEMA ---
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

// ১. প্রোডাক্ট রুটসমূহ
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json({ message: 'Product Added Successfully!', product: newProduct });
});

// প্রোডাক্ট ডিলিট করার API
app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product Deleted' });
});

// ২. অর্ডার রুটসমূহ
app.post('/api/orders', async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  
  for (let item of req.body.items) {
    if (item.id) {
      await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.qty } });
    }
  }

  res.json({ success: true, message: 'Order Placed!', orderId: newOrder._id });
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// কাস্টমারের ফোন নম্বর দিয়ে অর্ডার খোঁজার API
app.get('/api/orders/track/:phone', async (req, res) => {
  const orders = await Order.find({ phone: req.params.phone }).sort({ createdAt: -1 });
  res.json(orders);
});

// অর্ডারের স্ট্যাটাস আপডেট করার API
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true, message: 'Status Updated' });
});

// অর্ডার ডিলিট করার API
app.delete('/api/orders/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Order Deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
