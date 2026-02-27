import { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichSchichtzuweisungen, enrichVerfuegbarkeit } from '@/lib/enrich';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import type { Schichtzuweisungen, Mitarbeiter } from '@/types/app';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronLeft, ChevronRight, Plus, Trash2, CalendarDays, Users, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import { SchichtzuweisungenDialog } from '@/components/dialogs/SchichtzuweisungenDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatCard } from '@/components/StatCard';
import {
  addDays, startOfWeek, format, isSameDay, parseISO, isWithinInterval, isToday,
} from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  verfuegbar: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  eingeschraenkt_verfuegbar: 'bg-amber-100 text-amber-700 border-amber-200',
  nicht_verfuegbar: 'bg-red-100 text-red-700 border-red-200',
};
const STATUS_LABELS: Record<string, string> = {
  verfuegbar: 'Verfügbar',
  eingeschraenkt_verfuegbar: 'Eingeschränkt',
  nicht_verfuegbar: 'Nicht verfügbar',
};

const SHIFT_COLORS = [
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
];

export default function DashboardOverview() {
  const {
    schichtvorlagen, schichtzuweisungen, mitarbeiter, verfuegbarkeit,
    schichtvorlagenMap, mitarbeiterMap,
    loading, error, fetchAll,
  } = useDashboardData();

  // All hooks must be before early returns
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Schichtzuweisungen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillMitarbeiter, setPrefillMitarbeiter] = useState<string | undefined>(undefined);

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const enrichedSchichtzuweisungen = useMemo(
    () => enrichSchichtzuweisungen(schichtzuweisungen, { mitarbeiterMap, schichtvorlagenMap }),
    [schichtzuweisungen, mitarbeiterMap, schichtvorlagenMap]
  );

  const enrichedVerfuegbarkeit = useMemo(
    () => enrichVerfuegbarkeit(verfuegbarkeit, { mitarbeiterMap }),
    [verfuegbarkeit, mitarbeiterMap]
  );

  // Shift color index by template id
  const templateColorMap = useMemo(() => {
    const map = new Map<string, string>();
    schichtvorlagen.forEach((sv, i) => {
      map.set(sv.record_id, SHIFT_COLORS[i % SHIFT_COLORS.length]);
    });
    return map;
  }, [schichtvorlagen]);

  // Assignments keyed by "YYYY-MM-DD|mitarbeiterId"
  const assignmentMap = useMemo(() => {
    const map = new Map<string, typeof enrichedSchichtzuweisungen>();
    for (const a of enrichedSchichtzuweisungen) {
      if (!a.fields.datum) continue;
      const mid = extractRecordId(a.fields.mitarbeiter);
      if (!mid) continue;
      const key = `${a.fields.datum}|${mid}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [enrichedSchichtzuweisungen]);

  // Availability check
  const getAvailability = useCallback((mitarbeiterId: string, day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    for (const v of enrichedVerfuegbarkeit) {
      const mid = extractRecordId(v.fields.mitarbeiter);
      if (mid !== mitarbeiterId) continue;
      if (!v.fields.von_datum || !v.fields.bis_datum) continue;
      try {
        const from = parseISO(v.fields.von_datum);
        const to = parseISO(v.fields.bis_datum);
        if (isWithinInterval(parseISO(dayStr), { start: from, end: to })) {
          return v.fields.verfuegbarkeitsstatus;
        }
      } catch { /* ignore */ }
    }
    return null;
  }, [enrichedVerfuegbarkeit]);

  const handleOpenCreate = (day?: Date, mitarbeiterId?: string) => {
    setEditRecord(null);
    setPrefillDate(day ? format(day, 'yyyy-MM-dd') : undefined);
    setPrefillMitarbeiter(
      mitarbeiterId ? createRecordUrl(APP_IDS.MITARBEITER, mitarbeiterId) : undefined
    );
    setDialogOpen(true);
  };

  const handleOpenEdit = (record: Schichtzuweisungen) => {
    setEditRecord(record);
    setPrefillDate(undefined);
    setPrefillMitarbeiter(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteSchichtzuweisungenEntry(deleteTarget);
    setDeleteTarget(null);
    fetchAll();
  };

  const weekLabel = `${format(weekStart, 'd. MMM', { locale: de })} – ${format(addDays(weekStart, 6), 'd. MMM yyyy', { locale: de })}`;

  // Stats
  const thisWeekAssignments = useMemo(() => {
    const start = format(weekStart, 'yyyy-MM-dd');
    const end = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    return schichtzuweisungen.filter(a => a.fields.datum && a.fields.datum >= start && a.fields.datum <= end);
  }, [schichtzuweisungen, weekStart]);

  const activeEmployees = useMemo(() => {
    const ids = new Set(thisWeekAssignments.map(a => extractRecordId(a.fields.mitarbeiter)).filter(Boolean));
    return ids.size;
  }, [thisWeekAssignments]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const defaultValuesForDialog = editRecord
    ? editRecord.fields
    : {
        datum: prefillDate,
        mitarbeiter: prefillMitarbeiter,
      };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Schichtplanung</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Wochenübersicht & Zuweisung</p>
        </div>
        <Button onClick={() => handleOpenCreate()} className="gap-2">
          <Plus size={16} />
          Schicht zuweisen
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Mitarbeiter"
          value={String(mitarbeiter.length)}
          description="Gesamt"
          icon={<Users size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Diese Woche"
          value={String(thisWeekAssignments.length)}
          description="Schichtzuweisungen"
          icon={<CalendarDays size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Aktive MA"
          value={String(activeEmployees)}
          description="Diese Woche eingeteilt"
          icon={<CheckCircle2 size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Vorlagen"
          value={String(schichtvorlagen.length)}
          description="Schichtvorlagen"
          icon={<Clock size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Weekly planner */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Week nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{weekLabel}</p>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-xs text-primary hover:underline mt-0.5"
              >
                Aktuelle Woche
              </button>
            )}
          </div>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {mitarbeiter.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Keine Mitarbeiter vorhanden. Bitte zuerst Mitarbeiter anlegen.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b">
                  {/* Employee column header */}
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground bg-muted/20 w-36 min-w-36">
                    Mitarbeiter
                  </th>
                  {weekDays.map(day => (
                    <th
                      key={day.toISOString()}
                      className={`text-center px-2 py-2.5 text-xs font-semibold min-w-[100px] ${
                        isToday(day) ? 'bg-primary/8 text-primary' : 'text-muted-foreground bg-muted/20'
                      }`}
                    >
                      <div className="font-semibold">{format(day, 'EEE', { locale: de })}</div>
                      <div className={`text-base font-bold mt-0.5 ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                        {format(day, 'd', { locale: de })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mitarbeiter.map((emp, empIdx) => (
                  <tr key={emp.record_id} className={`border-b last:border-0 ${empIdx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    {/* Employee cell */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-sm text-foreground">
                        {emp.fields.vorname} {emp.fields.nachname}
                      </div>
                      {emp.fields.mitarbeiternummer && (
                        <div className="text-xs text-muted-foreground">{emp.fields.mitarbeiternummer}</div>
                      )}
                    </td>
                    {/* Day cells */}
                    {weekDays.map(day => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const key = `${dayStr}|${emp.record_id}`;
                      const assignments = assignmentMap.get(key) ?? [];
                      const avail = getAvailability(emp.record_id, day);

                      return (
                        <td
                          key={day.toISOString()}
                          className={`px-1.5 py-2 align-top relative group cursor-pointer ${
                            isToday(day) ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            if (assignments.length === 0) handleOpenCreate(day, emp.record_id);
                          }}
                        >
                          {/* Availability indicator */}
                          {avail && assignments.length === 0 && (
                            <div className={`text-[10px] px-1.5 py-0.5 rounded-full border mb-1 text-center ${STATUS_COLORS[avail] ?? ''}`}>
                              {STATUS_LABELS[avail] ?? avail}
                            </div>
                          )}

                          {/* Assignments */}
                          <div className="space-y-1">
                            {assignments.map(a => {
                              const templateId = extractRecordId(a.fields.schichtvorlage);
                              const template = templateId ? schichtvorlagenMap.get(templateId) : null;
                              const colorClass = templateId ? (templateColorMap.get(templateId) ?? SHIFT_COLORS[0]) : SHIFT_COLORS[0];
                              return (
                                <div
                                  key={a.record_id}
                                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium ${colorClass} cursor-pointer hover:opacity-80 transition-opacity`}
                                  onClick={e => { e.stopPropagation(); handleOpenEdit(a); }}
                                >
                                  <div className="font-semibold truncate">
                                    {template?.fields.schichtname ?? 'Schicht'}
                                  </div>
                                  {(template?.fields.startzeit || template?.fields.endzeit) && (
                                    <div className="opacity-70 text-[10px]">
                                      {template?.fields.startzeit ?? ''}–{template?.fields.endzeit ?? ''}
                                    </div>
                                  )}
                                  <button
                                    className="mt-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                                    onClick={e => { e.stopPropagation(); setDeleteTarget(a.record_id); }}
                                    title="Löschen"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add button on hover when empty */}
                          {assignments.length === 0 && (
                            <div className="hidden group-hover:flex items-center justify-center py-2 text-muted-foreground/50 hover:text-primary transition-colors">
                              <Plus size={14} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      {schichtvorlagen.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">Schichten:</span>
          {schichtvorlagen.map((sv, i) => (
            <span
              key={sv.record_id}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SHIFT_COLORS[i % SHIFT_COLORS.length]}`}
            >
              {sv.fields.schichtname ?? 'Unbenannt'}
              {sv.fields.startzeit && sv.fields.endzeit && (
                <span className="opacity-60 ml-1">{sv.fields.startzeit}–{sv.fields.endzeit}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <SchichtzuweisungenDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditRecord(null); }}
        onSubmit={async (fields) => {
          if (editRecord) {
            await LivingAppsService.updateSchichtzuweisungenEntry(editRecord.record_id, fields);
          } else {
            await LivingAppsService.createSchichtzuweisungenEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={defaultValuesForDialog}
        mitarbeiterList={mitarbeiter}
        schichtvorlagenList={schichtvorlagen}
        enablePhotoScan={AI_PHOTO_SCAN['Schichtzuweisungen']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Schicht löschen"
        description="Diese Schichtzuweisung wirklich löschen?"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
