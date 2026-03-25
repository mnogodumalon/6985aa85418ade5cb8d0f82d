// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Verfuegbarkeit {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    mitarbeiter?: string; // applookup -> URL zu 'Mitarbeiter' Record
    von_datum?: string; // Format: YYYY-MM-DD oder ISO String
    bis_datum?: string; // Format: YYYY-MM-DD oder ISO String
    verfuegbarkeitsstatus?: LookupValue;
    notizen?: string;
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

export const APP_IDS = {
  VERFUEGBARKEIT: '6985aa67b478880a8049480b',
  MITARBEITER: '6985aa61af35c01ef651189d',
  SCHICHTZUWEISUNGEN: '6985aa687b878d5fa3c976b9',
  SCHICHTVORLAGEN: '6985aa67d601784e5e3d3fdf',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'verfuegbarkeit': {
    verfuegbarkeitsstatus: [{ key: "eingeschraenkt_verfuegbar", label: "Eingeschränkt verfügbar" }, { key: "verfuegbar", label: "Verfügbar" }, { key: "nicht_verfuegbar", label: "Nicht verfügbar" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'verfuegbarkeit': {
    'mitarbeiter': 'applookup/select',
    'von_datum': 'date/date',
    'bis_datum': 'date/date',
    'verfuegbarkeitsstatus': 'lookup/select',
    'notizen': 'string/textarea',
  },
  'mitarbeiter': {
    'mitarbeiternummer': 'string/text',
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
  },
  'schichtzuweisungen': {
    'mitarbeiter': 'applookup/select',
    'schichtvorlage': 'applookup/select',
    'datum': 'date/date',
    'tatsaechliche_startzeit': 'string/text',
    'tatsaechliche_endzeit': 'string/text',
    'bemerkungen': 'string/textarea',
  },
  'schichtvorlagen': {
    'endzeit': 'string/text',
    'beschreibung': 'string/textarea',
    'schichtname': 'string/text',
    'startzeit': 'string/text',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateVerfuegbarkeit = StripLookup<Verfuegbarkeit['fields']>;
export type CreateMitarbeiter = StripLookup<Mitarbeiter['fields']>;
export type CreateSchichtzuweisungen = StripLookup<Schichtzuweisungen['fields']>;
export type CreateSchichtvorlagen = StripLookup<Schichtvorlagen['fields']>;