'use client'
import { useState, useEffect } from 'react';

export default function Home() {
  const [locations, setLocations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitationStatus, setInvitationStatus] = useState(null);

  // Function to fetch the locations
  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      if (res.ok) {
        setLocations(data.locations);
      } else {
        setError(data.error || 'Failed to fetch locations.');
      }
    } catch (e) {
      setError('An error occurred while fetching locations.');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to manage the invitation
  const handleAcceptInvitation = async () => {
    setInvitationStatus('Processing invitation...');
    try {
      const res = await fetch('/api/manage-invitations', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setInvitationStatus(data.message + ' You can now check locations.');
      } else {
        setInvitationStatus(data.message || 'Failed to accept invitation.');
      }
    } catch (e) {
      setInvitationStatus('An error occurred during invitation process.');
    }
  };

  useEffect(() => {
    // We can remove this for a button-driven flow
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Google Business Profile POC
        </p>
      </div>

      <div className="relative z-[-1] flex place-items-center">
        <h1 className="text-4xl font-bold mb-4">Service Account POC</h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-2 lg:text-left gap-4">
        {/* New button to accept invitation */}
        <button
          onClick={handleAcceptInvitation}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            1. Accept Invitation{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              ->
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            This will trigger the API to find and accept the pending invitation.
          </p>
        </button>

        {/* Existing button to fetch locations */}
        <button
          onClick={fetchLocations}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            2. Fetch Locations{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              ->
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            After accepting the invitation, this will list the business locations.
          </p>
        </button>
      </div>

      {/* Status and Results */}
      <div className="w-full max-w-5xl">
        {invitationStatus && (
          <div className="bg-blue-100 p-4 rounded-lg mb-4 text-center">
            <p className="font-semibold">{invitationStatus}</p>
          </div>
        )}
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {locations && locations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Locations</h2>
            <ul className="grid gap-4 lg:grid-cols-2">
              {locations.map((loc, index) => (
                <li key={index} className="border p-4 rounded-lg shadow">
                  <p><strong>Name:</strong> {loc.locationName}</p>
                  <p><strong>Store Code:</strong> {loc.storeCode || 'N/A'}</p>
                  <p><strong>Location ID:</strong> {loc.name.split('/').pop()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
