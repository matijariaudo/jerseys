const { Router } = require('express');
const axios = require('axios');
require('dotenv').config();

const IpRouter = Router();
const API_TOKEN = process.env.TOKEN_IP;

IpRouter.get('/ip', async (req, res) => {
    try {
       const ip = req.ip;
        const cleanIP = ip.startsWith('::ffff:') ? ip.split(':').pop() : ip;
        console.log(cleanIP,API_TOKEN)
        // Consultar la API de ipregistry con la IP del cliente
        const response = await axios.get(`https://api.ipregistry.co/${cleanIP!='127.0.0.1' && cleanIP!='::1'?cleanIP:'110.171.107.166'}?key=${API_TOKEN}`);
        //console.log(response)
        const {location:data} = response.data;
        const {languaje,country}=data||{};
        // Devolver los datos al cliente
        return res.status(200).json({languaje,country});
    } catch (error) {
        //console.log(error)
        return res.status(400).json({ error: error.message });
    }
});

module.exports = IpRouter;