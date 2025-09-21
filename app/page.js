'use client'; // This is a Client Component

import { useState } from 'react';

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitationStatus, setInvitationStatus] = useState(null);

  // Function to fetch locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      if (res.ok) {
        setLocations(data.locations || []);
      } else {
        setError(data.error || 'Failed to fetch locations.');
      }
    } catch (e) {
      setError('An error occurred while fetching locations.');
    } finally {
      setLoading(false);
    }
  };

  // Function to manage the invitation
  const handleAcceptInvitation = async () => {
    setInvitationStatus('Processing invitation...');
    try {
      const res = await fetch('/api/manage-invitations', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setInvitationStatus(data.message + ' You can now click "Fetch Locations" to see your data.');
      } else {
        setInvitationStatus(data.message || 'Failed to accept invitation.');
      }
    } catch (e) {
      setInvitationStatus('An error occurred during invitation process.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Google Business Profile Manager</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleAcceptInvitation}
          disabled={loading}
          style={{ backgroundColor: '#4ade80', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Accept Invitation'}
        </button>
        <button
          onClick={fetchLocations}
          disabled={loading}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Fetching...' : 'Fetch All Locations'}
        </button>
      </div>

      {invitationStatus && (
        <p style={{ backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '5px', color: '#0c4a6e' }}>
          {invitationStatus}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {locations && locations.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Your Locations:</h2>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {locations.map((location) => (
              <li key={location.name} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '6px' }}>
                <h3>{location.displayName}</h3>
                <p>ID: {location.name}</p>
                <p>Store Code: {location.storeCode || 'N/A'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
