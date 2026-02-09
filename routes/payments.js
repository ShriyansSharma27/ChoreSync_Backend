const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const payment_router = express.Router();

// Payment done via Stripe checkout session
payment_router.post('/checkout-session', async(req, res) => {
    try {
        const {amount} = req.body;
        const unitAmount = Math.round(parseFloat(amount) * 100);
        const sess = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'ChoreSync',
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/orders`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
        });

        res.status(200).json({
            url: sess.url
        });
    }
    catch (e) {
        console.error("Stripe Session Error:", e.message);
        res.status(500).json({
            error: e.message
        });
    }
});

module.exports = payment_router;