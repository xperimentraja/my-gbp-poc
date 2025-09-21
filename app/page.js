'use client'; // This is a Client Component

import { useState, useEffect } from 'react';

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This useEffect no longer calls fetchData() on its own.
  // The API calls will now only happen when you click the button.
  useEffect(() => {
    // This hook is now empty as we want actions to be button-driven.
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchLocations(), fetchInvitations()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      if (!res.ok) {
        throw new Error(`Failed to fetch locations: ${res.statusText}`);
      }
      const data = await res.json();
      setLocations(data);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const fetchInvitations = async () => {
    try {
      // Assuming a new API endpoint for fetching invitations
      const res = await fetch('/api/invitations');
      if (!res.ok) {
        throw new Error(`Failed to fetch invitations: ${res.statusText}`);
      }
      const data = await res.json();
      setInvitations(data);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const updateServices = async (locationId, newService) => {
    setLoading(true);
    try {
      const services = [newService];
      const res = await fetch('/api/update-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, services }),
      });
      if (!res.ok) {
        throw new Error('Failed to update services');
      }
      // Re-fetch data to show the updated information
      await fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationName) => {
    setLoading(true);
    try {
      // Assuming a new API endpoint to accept an invitation
      const res = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationName }),
      });
      if (!res.ok) {
        throw new Error('Failed to accept invitation');
      }
      // Re-fetch data to show the updated locations and invitations
      await fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Google Business Profile Manager</h1>
      <button onClick={fetchData} disabled={loading} style={{ marginBottom: '20px' }}>
        {loading ? 'Fetching...' : 'Fetch All Data'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {invitations.length > 0 && (
        <div style={{ border: '2px solid #6366f1', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Pending Invitations:</h2>
          {invitations.map((invitation) => (
            <div key={invitation.name} style={{ border: '1px solid #a5b4fc', padding: '10px', margin: '10px 0', borderRadius: '6px' }}>
              <p>ID: {invitation.name}</p>
              <p>Type: {invitation.targetType}</p>
              <button
                onClick={() => acceptInvitation(invitation.name)}
                disabled={loading}
                style={{ backgroundColor: '#4ade80', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </button>
            </div>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div>
          <h2>Your Locations:</h2>
          {locations.map((location) => (
            <div key={location.name} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '6px' }}>
              <h3>{location.displayName}</h3>
              <p>ID: {location.name}</p>
              <h4>Services:</h4>
              <ul>
                {location.services && location.services.length > 0 ? (
                  location.services.map((service, index) => (
                    <li key={index}>
                      <strong>ID:</strong> {service.serviceId}
                      {service.displayName && <span>, <strong>Name:</strong> {service.displayName}</span>}
                    </li>
                  ))
                ) : (
                  <li>No services found.</li>
                )}
              </ul>
              <button
                onClick={() => updateServices(location.name, { displayName: 'Online Ordering', description: 'Quick online ordering for pickup and delivery.' })}
                disabled={loading}
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
              >
                Add "Online Ordering" Service
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
