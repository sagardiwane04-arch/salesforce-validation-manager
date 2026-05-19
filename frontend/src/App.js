import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = 'https://salesforce-validation-manager-1pkx.onrender.com';

function App() {

  const [rules, setRules] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState('');

  // Login
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  // Get token after callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const instance = params.get('instance_url');

    if (token) {
      setAccessToken(token);
      setInstanceUrl(instance);
      fetchObjects(token, instance);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Fetch Objects
  const fetchObjects = async (token, instance) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/objects?token=${token}&instance=${instance}`
      );
      setObjects(response.data.sobjects);
    } catch (error) {
      console.log(error);
      alert('Error fetching objects');
    }
  };

  // Fetch Validation Rules
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/validation-rules?token=${accessToken}&instance=${instanceUrl}&objectName=${selectedObject}`
      );
      setRules(response.data.records || []);
    } catch (error) {
      console.log(error);
      alert('Error fetching rules');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Rule
  const toggleRule = async (rule) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/validation-rules/${rule.Id}`,
        {
          active: !rule.Active,
          token: accessToken,
          instance: instanceUrl
        }
      );
      console.log(response.data);
      setRules(
        rules.map((r) =>
          r.Id === rule.Id ? { ...r, Active: !r.Active } : r
        )
      );
    } catch (err) {
      console.log(err);
      alert('Error updating rule');
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>

      <h1>⚡ Salesforce Validation Rules Manager</h1>

      {!accessToken ? (

        <button
          onClick={handleLogin}
          style={{
            padding: '10px 20px',
            background: '#0070d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔐 Login with Salesforce
        </button>

      ) : (

        <div>

          <p style={{ color: 'green' }}>✅ Connected to Salesforce!</p>

          {/* Object Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <select
              value={selectedObject}
              onChange={(e) => setSelectedObject(e.target.value)}
              style={{
                padding: '10px',
                width: '250px',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Object</option>
              {objects.map((obj) => (
                <option key={obj.name} value={obj.name}>
                  {obj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fetch Button */}
          <button
            onClick={fetchRules}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📋 Get Validation Rules
          </button>

          {/* Loading */}
          {loading && <p>Loading rules...</p>}

          {/* Rules Table */}
          {rules && rules.length > 0 && (
            <table
              style={{
                marginTop: '20px',
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
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
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: rule.Active ? '#4CAF50' : '#f44336',
                          color: 'white'
                        }}
                      >
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