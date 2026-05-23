import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = 'https://salesforce-validation-manager-lpkx.onrender.com';

function App() {
  const [rules, setRules] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState('');

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  const handleLogout = () => {
    setAccessToken('');
    setInstanceUrl('');
    setRules([]);
    setObjects([]);
    window.location.href = '/';
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const instance = params.get('instance_url');
    if (token && instance) {
      setAccessToken(token);
      setInstanceUrl(instance);
      fetchObjects(token, instance);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const fetchObjects = async (token, instance) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/objects?token=${token}&instance=${instance}`);
      setObjects(response.data.sobjects);
    } catch (error) {
      alert('Error fetching objects');
    }
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/validation-rules?token=${accessToken}&instance=${instanceUrl}&objectName=${selectedObject}`
      );
      setRules(response.data.records || []);
    } catch (error) {
      alert('Error fetching rules');
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (rule) => {
    try {
      await axios.patch(`${BACKEND_URL}/validation-rules/${rule.Id}`, {
        active: !rule.Active,
        token: accessToken,
        instance: instanceUrl
      });
      setRules(rules.map((r) => r.Id === rule.Id ? { ...r, Active: !r.Active } : r));
    } catch (err) {
      alert('Error updating rule');
    }
  };

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0070d2 0%, #032d60 100%)',
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    navbar: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    navTitle: {
      color: 'white',
      fontSize: '22px',
      fontWeight: 'bold',
      margin: 0,
    },
    logoutBtn: {
      padding: '8px 18px',
      background: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.4)',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    loginContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      color: 'white',
    },
    loginCard: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '60px 50px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    loginTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    loginSubtitle: {
      fontSize: '16px',
      opacity: '0.8',
      marginBottom: '40px',
    },
    loginBtn: {
      padding: '16px 40px',
      background: 'white',
      color: '#0070d2',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      transition: 'transform 0.2s',
    },
    mainContainer: {
      padding: '30px',
      maxWidth: '1100px',
      margin: '0 auto',
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '25px',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    },
    connectedBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: '#e8f5e9',
      color: '#2e7d32',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    select: {
      padding: '12px 16px',
      width: '300px',
      borderRadius: '10px',
      fontSize: '15px',
      border: '2px solid #e0e0e0',
      outline: 'none',
      marginRight: '15px',
    },
    fetchBtn: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #4CAF50, #2e7d32)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: 'bold',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
    },
    th: {
      padding: '14px 16px',
      background: 'linear-gradient(135deg, #0070d2, #032d60)',
      color: 'white',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '600',
    },
    td: {
      padding: '14px 16px',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.app}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>⚡ Salesforce Validation Manager</h1>
        {accessToken && (
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        )}
      </div>

      {!accessToken ? (

        /* Login Page */
        <div style={styles.loginContainer}>
          <div style={styles.loginCard}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚡</div>
            <h2 style={styles.loginTitle}>Validation Rules Manager</h2>
            <p style={styles.loginSubtitle}>
              Manage your Salesforce Validation Rules<br />easily in one place
            </p>
            <button onClick={handleLogin} style={styles.loginBtn}>
              🔐 Login with Salesforce
            </button>
            <p style={{ marginTop: '20px', opacity: '0.6', fontSize: '13px' }}>
              Secure OAuth 2.0 Authentication
            </p>
          </div>
        </div>

      ) : (

        /* Main App */
        <div style={styles.mainContainer}>

          <div style={styles.card}>
            <div style={styles.connectedBadge}>
              ✅ Connected to Salesforce
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <select
                value={selectedObject}
                onChange={(e) => setSelectedObject(e.target.value)}
                style={styles.select}
              >
                <option value="">🔍 Select Object</option>
                {objects.map((obj) => (
                  <option key={obj.name} value={obj.name}>{obj.name}</option>
                ))}
              </select>

              <button onClick={fetchRules} style={styles.fetchBtn} disabled={!selectedObject}>
                📋 Get Validation Rules
              </button>
            </div>
          </div>

          {loading && (
            <div style={{ ...styles.card, textAlign: 'center', color: '#0070d2' }}>
              ⏳ Loading rules...
            </div>
          )}

          {rules && rules.length > 0 && (
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 15px', color: '#032d60' }}>
                📋 Validation Rules ({rules.length})
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rule Name</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, index) => (
                    <tr key={rule.Id} style={{ background: index % 2 === 0 ? '#fafafa' : 'white' }}>
                      <td style={styles.td}><strong>{rule.ValidationName}</strong></td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          padding: '5px 14px',
                          borderRadius: '20px',
                          background: rule.Active ? '#e8f5e9' : '#ffebee',
                          color: rule.Active ? '#2e7d32' : '#c62828',
                          fontWeight: 'bold',
                          fontSize: '13px',
                        }}>
                          {rule.Active ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button
                          onClick={() => toggleRule(rule)}
                          style={{
                            padding: '7px 18px',
                            background: rule.Active
                              ? 'linear-gradient(135deg, #f44336, #c62828)'
                              : 'linear-gradient(135deg, #4CAF50, #2e7d32)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px',
                          }}
                        >
                          {rule.Active ? '⛔ Deactivate' : '✅ Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default App;