import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Verfuegbarkeit, Mitarbeiter, Schichtzuweisungen, Schichtvorlagen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [verfuegbarkeit, setVerfuegbarkeit] = useState<Verfuegbarkeit[]>([]);
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [schichtzuweisungen, setSchichtzuweisungen] = useState<Schichtzuweisungen[]>([]);
  const [schichtvorlagen, setSchichtvorlagen] = useState<Schichtvorlagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [verfuegbarkeitData, mitarbeiterData, schichtzuweisungenData, schichtvorlagenData] = await Promise.all([
        LivingAppsService.getVerfuegbarkeit(),
        LivingAppsService.getMitarbeiter(),
        LivingAppsService.getSchichtzuweisungen(),
        LivingAppsService.getSchichtvorlagen(),
      ]);
      setVerfuegbarkeit(verfuegbarkeitData);
      setMitarbeiter(mitarbeiterData);
      setSchichtzuweisungen(schichtzuweisungenData);
      setSchichtvorlagen(schichtvorlagenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [verfuegbarkeitData, mitarbeiterData, schichtzuweisungenData, schichtvorlagenData] = await Promise.all([
          LivingAppsService.getVerfuegbarkeit(),
          LivingAppsService.getMitarbeiter(),
          LivingAppsService.getSchichtzuweisungen(),
          LivingAppsService.getSchichtvorlagen(),
        ]);
        setVerfuegbarkeit(verfuegbarkeitData);
        setMitarbeiter(mitarbeiterData);
        setSchichtzuweisungen(schichtzuweisungenData);
        setSchichtvorlagen(schichtvorlagenData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const mitarbeiterMap = useMemo(() => {
    const m = new Map<string, Mitarbeiter>();
    mitarbeiter.forEach(r => m.set(r.record_id, r));
    return m;
  }, [mitarbeiter]);

  const schichtvorlagenMap = useMemo(() => {
    const m = new Map<string, Schichtvorlagen>();
    schichtvorlagen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [schichtvorlagen]);

  return { verfuegbarkeit, setVerfuegbarkeit, mitarbeiter, setMitarbeiter, schichtzuweisungen, setSchichtzuweisungen, schichtvorlagen, setSchichtvorlagen, loading, error, fetchAll, mitarbeiterMap, schichtvorlagenMap };
}