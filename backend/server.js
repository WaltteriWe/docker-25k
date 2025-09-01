const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a MongoDB schema and model
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', ItemSchema);

// Middleware for JSON parsing
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root endpoint with container and environment info
app.get('/', (req, res) => {
  const info = {
    message: 'Express Backend API Running in Docker with MongoDB',
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname(),
    platform: os.platform(),
    database: MONGODB_URI,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    containerInfo: {
      cpus: os.cpus().length,
      totalMemory: `${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`
    },
    endpoints: [
      { method: 'GET', path: '/', description: 'System information' },
      { method: 'GET', path: '/api/items', description: 'Get all items from database' },
      { method: 'GET', path: '/api/items/:id', description: 'Get item by ID from database' },
      { method: 'POST', path: '/api/items', description: 'Create new item in database' },
      { method: 'DELETE', path: '/api/items/:id', description: 'Delete item from database' },
      { method: 'GET', path: '/health', description: 'Health check' }
    ]
  };
  
  res.json(info);
});

// API endpoints
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const newItem = new Item({ name });
    await newItem.save();
    
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'UP',
    database: dbStatus,
    timestamp: new Date() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Container hostname: ${os.hostname()}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});