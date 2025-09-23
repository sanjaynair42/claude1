// Backend API endpoint (Node.js/Express example)
// This would run on a server like Vercel, Netlify Functions, or your own server

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables you'd set on your server:
// SALESFORCE_CLIENT_ID=your_consumer_key
// SALESFORCE_CLIENT_SECRET=your_consumer_secret
// SALESFORCE_REDIRECT_URI=https://sanjaynair42.github.io/claude1/

app.post('/api/salesforce/token', async (req, res) => {
    const { code, state } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
    }
    
    try {
        // Exchange authorization code for tokens
        const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.SALESFORCE_CLIENT_ID,
                client_secret: process.env.SALESFORCE_CLIENT_SECRET,
                redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
                code: code
            })
        });
        
        const tokenData = await response.json();
        
        if (response.ok) {
            // Return tokens to frontend (in production, consider storing securely)
            res.json({
                access_token: tokenData.access_token,
                instance_url: tokenData.instance_url,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expires_in
            });
        } else {
            res.status(400).json({ error: tokenData.error, description: tokenData.error_description });
        }
    } catch (error) {
        res.status(500).json({ error: 'Token exchange failed', message: error.message });
    }
});

// Refresh token endpoint
app.post('/api/salesforce/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
    }
    
    try {
        const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.SALESFORCE_CLIENT_ID,
                client_secret: process.env.SALESFORCE_CLIENT_SECRET,
                refresh_token: refresh_token
            })
        });
        
        const tokenData = await response.json();
        
        if (response.ok) {
            res.json({
                access_token: tokenData.access_token,
                instance_url: tokenData.instance_url,
                expires_in: tokenData.expires_in
            });
        } else {
            res.status(400).json({ error: tokenData.error, description: tokenData.error_description });
        }
    } catch (error) {
        res.status(500).json({ error: 'Token refresh failed', message: error.message });
    }
});

app.listen(3000, () => {
    console.log('Salesforce OAuth backend running on port 3000');
});

// Package.json dependencies needed:
/*
{
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.6.7",
    "cors": "^2.8.5"
  }
}
*/