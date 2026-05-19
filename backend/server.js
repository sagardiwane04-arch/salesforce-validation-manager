const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const LOGIN_URL = process.env.LOGIN_URL;

const app = express();
app.use(cors());
app.use(express.json());

// ✅ React Frontend Serve
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/login', (req, res) => {
    const loginUrl = LOGIN_URL + '/services/oauth2/authorize?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI;
    res.redirect(loginUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const tokenResponse = await axios.post(LOGIN_URL + '/services/oauth2/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            }
        });
        // ✅ Frontend ला token पाठवा
        const { access_token, instance_url } = tokenResponse.data;
        res.redirect(`/?access_token=${access_token}&instance_url=${encodeURIComponent(instance_url)}`);
    } catch (error) {
        res.send(error.response?.data || error.message);
    }
});

app.get('/objects', async (req, res) => {
    try {
        const token = req.query.token;
        const instance = req.query.instance;
        const response = await axios.get(
            `${instance}/services/data/v62.0/sobjects`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json(error.response?.data || { error: error.message });
    }
});

app.get('/validation-rules', async (req, res) => {
    try {
        const token = req.query.token;
        const instance = req.query.instance;
        const objectName = req.query.objectName;
        const url = `${instance}/services/data/v62.0/tooling/query/?q=SELECT+Id,ValidationName,Active,EntityDefinition.QualifiedApiName,ErrorMessage+FROM+ValidationRule+WHERE+EntityDefinition.QualifiedApiName='${objectName}'`;
        const response = await axios.get(url, {
            headers: { Authorization: 'Bearer ' + token }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json(error.response?.data || { error: error.message });
    }
});

app.patch('/validation-rules/:id', async (req, res) => {
    try {
        const ruleId = req.params.id;
        const { active, token, instance } = req.body;
        const getUrl = `${instance}/services/data/v62.0/tooling/sobjects/ValidationRule/${ruleId}`;
        const existingRule = await axios.get(getUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const metadata = existingRule.data.Metadata;
        metadata.active = active;
        await axios.patch(getUrl, { Metadata: metadata }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json(error.response?.data || { error: error.message });
    }
});

// ✅ सगळ्यात शेवटी - React catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ✅ Render साठी PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});