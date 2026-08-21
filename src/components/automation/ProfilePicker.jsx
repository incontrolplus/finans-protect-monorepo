import React, { useState, useEffect } from 'react';
import { UserCircle, RefreshCw } from 'lucide-react';

export default function ProfilePicker({ value, onChange }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      setProfiles(data.data || []);
    } catch (err) {
      setFetchError('Failed to load profiles');
      console.error('[ProfilePicker]', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
          <UserCircle className="w-4 h-4 text-sky-400" />
          Session Profile
        </label>
        <button onClick={fetchProfiles} className="text-gray-500 hover:text-gray-300">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <select
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
      >
        <option value="">No profile (fresh session)</option>
        {profiles.map(p => (
          <option key={p.profileId} value={p.profileId}>
            {p.profileId} {p.savedAt ? `(${new Date(p.savedAt).toLocaleDateString()})` : ''}
          </option>
        ))}
      </select>

      {loading && <p className="text-xs text-gray-500">Loading profiles...</p>}
      {fetchError && <p className="text-xs text-red-400">{fetchError}</p>}
      {!loading && !fetchError && profiles.length === 0 && (
        <p className="text-xs text-gray-600">No saved profiles. Save a session to create one.</p>
      )}
    </div>
  );
}
