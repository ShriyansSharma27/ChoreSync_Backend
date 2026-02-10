const express = require('express');
const auth_router = express.Router();
const db = require('../config');
const { ClerkMiddleAuth } = require('../middleware/authToken');

// Customer auth endpoints
auth_router.post('/customer/signup', async (req, res) => {
    try {
      const {first_name, last_name, email} = req.body;
      if (!first_name || !last_name || !email) return res.sendStatus(400);

      const checkExist = await db.query("SELECT * FROM Customer WHERE email = $1", [email]);
      if(checkExist.rows.length > 0) {
        return res.status(200).json({
          "message": "user exists"
        });
      }

      await db.query("INSERT INTO Customer ( first_name, last_name, email) VALUES ($1, $2, $3);", 
        [first_name, last_name, email]
      );  
      
      return res.sendStatus(201);

    } catch (err) {
      if(err.code === '23505') {
        return res.sendStatus(409);
      }
      return res.sendStatus(500);
    }
});

// Service provider auth endpoints
auth_router.post('/provider/signup', async (req, res) => {
    try {
      const {first_name, last_name, email} = req.body;
      
      if(!first_name || !last_name || !email) return res.sendStatus(400);

      const checkExist = await db.query("SELECT * FROM Service_providers WHERE email = $1", [email]);
      if(checkExist.rows.length > 0) {
        return res.status(200).json({
          "message": "user exists"
        });
      }

      await db.query("INSERT INTO Service_providers (first_name, last_name, email) values ($1,$2,$3)", 
        [first_name, last_name, email]
      );

      const checkExistCustomer = await db.query("SELECT * FROM Customer WHERE email = $1", [email]);
      if(checkExistCustomer.rows.length === 0) {
        await db.query("INSERT INTO Customer ( first_name, last_name, email) VALUES ($1, $2, $3);", 
        [first_name, last_name, email]
      ); 
      }
      
      return res.sendStatus(201);
    } 
    catch (err) {
      if(err.code === '23505') {
        return res.sendStatus(409);
      }
      return res.sendStatus(500);
    }
});

// Check if email is a provider
auth_router.get('/isprovider', ClerkMiddleAuth, async (req, res) => {
  try {
    const {email} = req.query;
    
    if(!email) return res.sendStatus(400);

    const checkExist = await db.query("SELECT * FROM Service_providers WHERE email = $1", [email]);

    if (checkExist.rows.length > 0) {
      res.json({ isProvider: true });
    } else {
      res.json({ isProvider: false });
    } 
  } 
  catch (err) {
    console.error("Error in is-provider check:", err);
    if(err.code === '23505') {
      return res.sendStatus(409);
    }
    return res.sendStatus(500);
  }
});

// Upgrade role
auth_router.post('/upgrade-role', ClerkMiddleAuth, async (req, res) => {
  try {
    const {first_name, last_name, email} = req.body;
    
    if(!email) return res.sendStatus(400);

    await db.query("INSERT INTO Service_providers (first_name, last_name, email) values ($1,$2,$3) ON CONFLICT (email) DO NOTHING", 
        [first_name, last_name, email]
      );

      return res.sendStatus(201);
  } 
  catch (err) {
    console.error("Error in is-provider check:", err);
    if(err.code === '23505') {
      return res.sendStatus(409);
    }
    return res.sendStatus(500);
  }
});


module.exports = auth_router;
