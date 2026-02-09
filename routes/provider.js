const express = require('express');
const provider_router = express.Router();
const db = require('../config');

// Get provider's id
const grab_provider = async (email) => {
  if (!email) {
    throw new Error("Email is required to fetch provider ID");
  }

  const result = await db.query("SELECT provider_id FROM Service_providers WHERE email = $1", [email]);
  
  if (result.rows.length === 0) {
    throw new Error("Provider not found");
  }
  
  return result.rows[0].provider_id;
};

// Service grabbing, addition, removal or modification endpoints
provider_router.post('/add_service', async (req, res) => {
    try {
      const { email, service, details, price, img_url } = req.body;
      const numPrice = parseFloat(price);
      
      if (!email || !service || !details || isNaN(numPrice) || numPrice < 0 || !img_url) {
        return res.sendStatus(400);
      }
      
      const provider_id = await grab_provider(email);

      // Check if service already exists for this provider
      const checkService = await db.query("SELECT * FROM Services WHERE service_name=$1 AND provider_id=$2", [service, provider_id]);
      if (checkService.rows.length > 0) {
        return res.json({ message: "existential conflict" });
      }

      await db.query("INSERT INTO Services (service_name, service_details, service_price, image_url, provider_id) values ($1, $2, $3, $4, $5)", 
        [service, details, numPrice, img_url, provider_id]
      );

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

provider_router.get('/get_services', async (req, res) => {
  try {
    const services = await db.query("SELECT * FROM Services");
    res.status(200).json({
      success: true,
      data: services.rows
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

provider_router.get('/provider_services', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.sendStatus(400);
    
    const provId = await grab_provider(email);
    const services = await db.query("SELECT service_name FROM Services WHERE provider_id =$1", [provId]);
    
    res.status(200).json({
      success: true,
      data: services.rows
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

provider_router.put('/modify_service', async (req, res) => {
    try {
      const { email, service_details } = req.body;

      if (!email || !service_details) return res.sendStatus(400);
      const { service_id, details, image_url } = service_details;

      if (!service_id || (!details && !image_url)) return res.sendStatus(400);
      
      const provider_id = await grab_provider(email);

      const find_service = await db.query("SELECT * FROM Services WHERE provider_id = $1 AND service_id = $2",
        [provider_id, service_id]
      );
      
      if (find_service.rows.length === 0) return res.status(404).json({ message: "Service not found" });

      const current = find_service.rows[0];
      
      await db.query("UPDATE Services SET service_details = $1, image_url = $2 WHERE provider_id = $3 AND service_id = $4",
        [details || current.service_details, image_url || current.image_url, provider_id, service_id]
      );
      
      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });

provider_router.delete('/remove_service', async (req, res) => {
  try {
    const { email, service_name } = req.query;
    if (!email || !service_name) return res.sendStatus(400);
    
    const provider_id = await grab_provider(email);
    
    // Safety check: ensure service exists and get ID
    const grabService = await db.query("SELECT service_id FROM Services WHERE provider_id=$1 AND service_name=$2", 
      [provider_id, service_name]
    );

    if (grabService.rows.length === 0) return res.sendStatus(404);
    const service_id = grabService.rows[0].service_id;

    // Prevent deletion if the service is currently being processed in an order
    const checkBought = await db.query("SELECT * FROM Bought_services WHERE service_id=$1", [service_id]);
    if (checkBought.rows.length > 0) {
      return res.json({ 'message': 'order exists' });
    }

    await db.query("DELETE FROM Services WHERE provider_id = $1 AND service_name=$2", 
      [provider_id, service_name]
    );
    return res.sendStatus(200);
  } 
  catch (err) {
    console.error(err);
    res.sendStatus(500); 
  }
});

// Helper to get provider details
provider_router.get('/:p_id/get_provider', async(req, res) => {
  try {
    const provider_id = req.params.p_id;
    const result = await db.query("SELECT first_name, last_name, email FROM Service_providers WHERE provider_id = $1", 
      [provider_id]
    );
    
    if (result.rows.length === 0) return res.sendStatus(404);
    
    return res.json({ 'success': true, 'details': result.rows[0] });
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = provider_router;