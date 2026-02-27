// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Schichtvorlagen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    endzeit?: string;
    beschreibung?: string;
    schichtname?: string;
    startzeit?: string;
  };
}

export interface Schichtzuweisungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    mitarbeiter?: string; // applookup -> URL zu 'Mitarbeiter' Record
    schichtvorlage?: string; // applookup -> URL zu 'Schichtvorlagen' Record
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    tatsaechliche_startzeit?: string;
    tatsaechliche_endzeit?: string;
    bemerkungen?: string;
  };
}

export interface Mitarbeiter {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    mitarbeiternummer?: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
  };
}

export interface Verfuegbarkeit {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    mitarbeiter?: string; // applookup -> URL zu 'Mitarbeiter' Record
    von_datum?: string; // Format: YYYY-MM-DD oder ISO String
    bis_datum?: string; // Format: YYYY-MM-DD oder ISO String
    verfuegbarkeitsstatus?: 'eingeschraenkt_verfuegbar' | 'verfuegbar' | 'nicht_verfuegbar';
    notizen?: string;
  };
}

export const APP_IDS = {
  SCHICHTVORLAGEN: '6985aa67d601784e5e3d3fdf',
  SCHICHTZUWEISUNGEN: '6985aa687b878d5fa3c976b9',
  MITARBEITER: '6985aa61af35c01ef651189d',
  VERFUEGBARKEIT: '6985aa67b478880a8049480b',
} as const;

// Helper Types for creating new records
export type CreateSchichtvorlagen = Schichtvorlagen['fields'];
export type CreateSchichtzuweisungen = Schichtzuweisungen['fields'];
export type CreateMitarbeiter = Mitarbeiter['fields'];
export type CreateVerfuegbarkeit = Verfuegbarkeit['fields'];