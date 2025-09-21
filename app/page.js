'use client'; // This is a Client Component

import { useState, useEffect } from 'react';

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/locations');
      if (!res.ok) {
        throw new Error(`Failed to fetch locations: ${res.statusText}`);
      }
      const data = await res.json();
      setLocations(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
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
      // Re-fetch locations to show the updated data
      await fetchLocations();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Google Business Profile Manager</h1>
      <button onClick={fetchLocations} disabled={loading}>
        {loading ? 'Fetching...' : 'Fetch All Locations'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {locations.length > 0 && (
        <div>
          <h2>Your Locations:</h2>
          {locations.map((location) => (
            <div key={location.name} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h3>{location.displayName}</h3>
              <p>ID: {location.name}</p>
              <h4>Services:</h4>
              <ul>
                {location.services.length > 0 ? (
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
              <button onClick={() => updateServices(location.name, { displayName: 'Online Ordering', description: 'Quick online ordering for pickup and delivery.' })}>
                Add "Online Ordering" Service
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}