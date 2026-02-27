import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Schichtvorlagen, Schichtzuweisungen, Mitarbeiter, Verfuegbarkeit } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [schichtvorlagen, setSchichtvorlagen] = useState<Schichtvorlagen[]>([]);
  const [schichtzuweisungen, setSchichtzuweisungen] = useState<Schichtzuweisungen[]>([]);
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [verfuegbarkeit, setVerfuegbarkeit] = useState<Verfuegbarkeit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [schichtvorlagenData, schichtzuweisungenData, mitarbeiterData, verfuegbarkeitData] = await Promise.all([
        LivingAppsService.getSchichtvorlagen(),
        LivingAppsService.getSchichtzuweisungen(),
        LivingAppsService.getMitarbeiter(),
        LivingAppsService.getVerfuegbarkeit(),
      ]);
      setSchichtvorlagen(schichtvorlagenData);
      setSchichtzuweisungen(schichtzuweisungenData);
      setMitarbeiter(mitarbeiterData);
      setVerfuegbarkeit(verfuegbarkeitData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const schichtvorlagenMap = useMemo(() => {
    const m = new Map<string, Schichtvorlagen>();
    schichtvorlagen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [schichtvorlagen]);

  const mitarbeiterMap = useMemo(() => {
    const m = new Map<string, Mitarbeiter>();
    mitarbeiter.forEach(r => m.set(r.record_id, r));
    return m;
  }, [mitarbeiter]);

  return { schichtvorlagen, setSchichtvorlagen, schichtzuweisungen, setSchichtzuweisungen, mitarbeiter, setMitarbeiter, verfuegbarkeit, setVerfuegbarkeit, loading, error, fetchAll, schichtvorlagenMap, mitarbeiterMap };
}