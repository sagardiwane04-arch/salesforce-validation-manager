const express = require('express');
const cors = require('cors');
const axios = require('axios');

const CLIENT_ID = '3MVG9WVXk15qiz1LNczc7umatKvFfSKAjmsam4PG240A9FkXX4yYh0fLit6AgcKBsfo2KOllu_s8VWu4zHrop';
const REDIRECT_URI = 'http://localhost:3000/callback';
const LOGIN_URL = 'https://login.salesforce.com';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('Backend Running');
});

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
        res.json(tokenResponse.data);
    } catch (error) {
        res.send(error.response?.data || error.message);
    }
});

app.get('/validation-rules', async (req, res) => {
    try {
        const token = req.query.token;
        const instance = req.query.instance;
        const url = instance + '/services/data/v62.0/tooling/query/?q=SELECT+Id,ValidationName,EntityDefinition.QualifiedApiName,ErrorMessage+FROM+ValidationRule';
        const response = await axios.get(url, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
        res.json(response.data);
    } catch (error) {
        res.send(error.response?.data || error.message);
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});