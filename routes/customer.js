const express = require('express');
const customer_router = express.Router();
const db = require('../config');

// Grab customer orders
customer_router.post('/purchase', async (req, res) => {
  try { 
    const { email, services } = req.body;
    
    // 1. Safety Check: Ensure data exists
    if (!email || !services || !Array.isArray(services)) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // 2. Fetch Customer ID with safety check
    const userResult = await db.query("SELECT customer_id FROM Customer WHERE email = $1", [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Customer profile not found" });
    }
    
    const customer_id = userResult.rows[0].customer_id;

    // 3. Process Orders
    for(let i = 0; i < services.length; i++) {
      const time_current = new Date();
      
    // Handle the timestamp safely
    const rawTimestamp = `${services[i].service_date}T${services[i].service_time}`;
    const serviceTimestamp = new Date(rawTimestamp);
    
    await db.query(`
      INSERT INTO bought_services (service_id, customer_id, bought_time, service_timestamp)
      VALUES ($1, $2, $3, $4)`, 
      [services[i].service_id, customer_id, time_current, serviceTimestamp]);
    } 

    res.status(200).json({ message: 'Placed orders successfully' });
  } catch (err) {
    console.error("Purchase Error:", err);
    res.sendStatus(500);
  }
});

// Grab customer orders
customer_router.post('/get_services', async(req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const querySql = `
      SELECT 
        s.service_name, 
        s.service_details, 
        s.service_price, 
        s.image_url, 
        bs.service_timestamp as date, 
        bs.service_timestamp as time
      FROM Bought_services bs
      JOIN Services s ON bs.service_id = s.service_id
      JOIN Customer c ON bs.customer_id = c.customer_id
      WHERE c.email = $1
      ORDER BY bs.bought_time DESC;
    `;

    let grabServices = await db.query(querySql, [email]);
    grabServices = grabServices.rows;

    return res.json({"data": grabServices});
  }
  catch(err) {
    console.error("Finding order error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = customer_router;