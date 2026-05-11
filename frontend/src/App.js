import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const CLIENT_ID = '3MVG9WVXk15qiz1LNczc7umatKvFfSKAjmsam4PG240A9FkXX4yYh0fLit6AgcKBsfo2KOllu_s8VWu4zHrop';      // from Connected App
const REDIRECT_URI = 'http://localhost:3000/callback';
const SF_LOGIN_URL = 'https://login.salesforce.com';

function App() {
  const [rules, setRules] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Login to Salesforce
  const handleLogin = () => {
    const authUrl = `${SF_LOGIN_URL}/services/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    window.location.href = authUrl;
  };

  // Step 2: Get token from URL after login
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      const instance = params.get('instance_url');
      if (token) {
        setAccessToken(token);
        setInstanceUrl(instance);
        window.location.hash = '';
      }
    }
  }, []);

  // Step 3: Fetch Validation Rules
  const fetchRules = async () => {

  try {

    setLoading(true);

    const response = await axios.get(
      `http://localhost:5000/validation-rules?token=${accessToken}&instance=${instanceUrl}`
    );

    console.log(response.data);

    setRules(response.data.records);

  } catch (error) {

    console.log(error);

    alert('Error fetching rules: ' + error.message);

  } finally {

    setLoading(false);
  }
};

  // Step 4: Toggle a rule
 const toggleRule = async (rule) => {
  try {

    const response = await axios.patch(
      `http://localhost:5000/validation-rules/${rule.Id}`,
      {
        active: !rule.Active,
        token: accessToken,
        instance: instanceUrl
      }
    );

    console.log(response.data);

    setRules(
      rules.map(r =>
        r.Id === rule.Id
          ? { ...r, Active: !r.Active }
          : r
      )
    );

  } catch (err) {

    console.log(err);

    alert('Error updating rule: ' + err.message);
  }
};

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h1>⚡ Salesforce Validation Rules Manager</h1>

      {/* Login Button */}
      {!accessToken ? (
        <button
          onClick={handleLogin}
          style={{ padding: '10px 20px', background: '#0070d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          🔐 Login with Salesforce
        </button>
      ) : (
        <div>
          <p style={{ color: 'green' }}>✅ Connected to Salesforce!</p>

          {/* Fetch Rules Button */}
          <button
            onClick={fetchRules}
            style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
          >
            📋 Get Validation Rules
          </button>

          {/* Loading */}
          {loading && <p>Loading rules...</p>}

          {/* Rules List */}
          {rules.length > 0 && (
            <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0070d2', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Rule Name</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.Id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{rule.ValidationName}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: rule.Active ? '#4CAF50' : '#f44336',
                        color: 'white'
                      }}>
                        {rule.Active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleRule(rule)}
                        style={{
                          padding: '6px 14px',
                          background: rule.Active ? '#f44336' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        {rule.Active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;