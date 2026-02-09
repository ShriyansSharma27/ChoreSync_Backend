require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware } = require('@clerk/express');

// App
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(bodyParser.json()); 
app.use(cookieParser());

// Importing Routes
const customer_routes = require('./routes/customer');
const provider_routes = require('./routes/provider');
const auth_routes = require('./routes/auth');
const payment_route = require('./routes/payments');

// API request rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 200,
  standardHeader: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56
})

// Routes
app.use(limiter);
app.use(clerkMiddleware());
app.use('/auth', auth_routes);
app.use('/api/customer', customer_routes);
app.use('/api/provider', provider_routes);
app.use('/', payment_route);

// Check server health
app.get('/health', (req, res) => res.status(200).send('Server is up and running!'));


// Start server
app.listen(PORT, () => {
  console.log(`Server running: ${PORT}`);
});
