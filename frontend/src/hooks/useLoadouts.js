import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const EMPTY_LOADOUTS = [{}, {}, {}];

function normalizeLoadouts(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return EMPTY_LOADOUTS.map(() => ({}));
  }

  return [data["0"] || {}, data["1"] || {}, data["2"] || {}];
}

export function useLoadouts({ user, isAuthenticated }) {
  const [loadouts, setLoadouts] = useState([{}, {}, {}]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Fetch loadouts when user authenticates
  useEffect(() => {
    async function fetchAll() {
      if (!isAuthenticated || !user) {
        setLoadouts(EMPTY_LOADOUTS.map(() => ({})));
        setLoadError(null);
        setSaveError(null);
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await api.getLoadouts();
        setLoadouts(normalizeLoadouts(data));
      } catch (err) {
        console.error("Failed to fetch loadouts", err);
        setLoadouts(EMPTY_LOADOUTS.map(() => ({})));
        setLoadError('Failed to fetch saved loadouts.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, [isAuthenticated, user]);

  const saveLoadout = useCallback(async (index, slotsData) => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await api.saveLoadout(index, slotsData);
      setLoadouts(prev => {
        const next = [...prev];
        next[index] = slotsData;
        return next;
      });
    } catch (err) {
      console.error("Failed to save loadout", err);
      setSaveError(`Failed to save loadout ${index + 1}.`);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated]);

  return {
    loadouts,
    isLoading,
    isSaving,
    loadError,
    saveError,
    saveLoadout
  };
}
