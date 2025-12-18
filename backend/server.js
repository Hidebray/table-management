const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

const tableRoutes = require('./routes/tableRoutes');
const tableController = require('./controllers/tableController');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Use Routes
app.use('/api/admin/tables', tableRoutes);
app.get('/api/menu', tableController.verifyQRToken);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Smart Restaurant API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});