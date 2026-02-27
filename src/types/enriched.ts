import type { Schichtzuweisungen, Verfuegbarkeit } from './app';

export type EnrichedSchichtzuweisungen = Schichtzuweisungen & {
  mitarbeiterName: string;
  schichtvorlageName: string;
};

export type EnrichedVerfuegbarkeit = Verfuegbarkeit & {
  mitarbeiterName: string;
};
