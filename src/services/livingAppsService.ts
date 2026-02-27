// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Schichtvorlagen, Schichtzuweisungen, Mitarbeiter, Verfuegbarkeit } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

/** Upload a file to LivingApps. Returns the file URL for use in record fields. */
export async function uploadFile(file: File | Blob, filename?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename ?? (file instanceof File ? file.name : 'upload'));
  const res = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
  const data = await res.json();
  return data.url;
}

export class LivingAppsService {
  // --- SCHICHTVORLAGEN ---
  static async getSchichtvorlagen(): Promise<Schichtvorlagen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.SCHICHTVORLAGEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getSchichtvorlagenEntry(id: string): Promise<Schichtvorlagen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.SCHICHTVORLAGEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createSchichtvorlagenEntry(fields: Schichtvorlagen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.SCHICHTVORLAGEN}/records`, { fields });
  }
  static async updateSchichtvorlagenEntry(id: string, fields: Partial<Schichtvorlagen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.SCHICHTVORLAGEN}/records/${id}`, { fields });
  }
  static async deleteSchichtvorlagenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.SCHICHTVORLAGEN}/records/${id}`);
  }

  // --- SCHICHTZUWEISUNGEN ---
  static async getSchichtzuweisungen(): Promise<Schichtzuweisungen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.SCHICHTZUWEISUNGEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getSchichtzuweisungenEntry(id: string): Promise<Schichtzuweisungen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.SCHICHTZUWEISUNGEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createSchichtzuweisungenEntry(fields: Schichtzuweisungen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.SCHICHTZUWEISUNGEN}/records`, { fields });
  }
  static async updateSchichtzuweisungenEntry(id: string, fields: Partial<Schichtzuweisungen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.SCHICHTZUWEISUNGEN}/records/${id}`, { fields });
  }
  static async deleteSchichtzuweisungenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.SCHICHTZUWEISUNGEN}/records/${id}`);
  }

  // --- MITARBEITER ---
  static async getMitarbeiter(): Promise<Mitarbeiter[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.MITARBEITER}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getMitarbeiterEntry(id: string): Promise<Mitarbeiter | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.MITARBEITER}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createMitarbeiterEntry(fields: Mitarbeiter['fields']) {
    return callApi('POST', `/apps/${APP_IDS.MITARBEITER}/records`, { fields });
  }
  static async updateMitarbeiterEntry(id: string, fields: Partial<Mitarbeiter['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.MITARBEITER}/records/${id}`, { fields });
  }
  static async deleteMitarbeiterEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.MITARBEITER}/records/${id}`);
  }

  // --- VERFUEGBARKEIT ---
  static async getVerfuegbarkeit(): Promise<Verfuegbarkeit[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.VERFUEGBARKEIT}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getVerfuegbarkeitEntry(id: string): Promise<Verfuegbarkeit | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.VERFUEGBARKEIT}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createVerfuegbarkeitEntry(fields: Verfuegbarkeit['fields']) {
    return callApi('POST', `/apps/${APP_IDS.VERFUEGBARKEIT}/records`, { fields });
  }
  static async updateVerfuegbarkeitEntry(id: string, fields: Partial<Verfuegbarkeit['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.VERFUEGBARKEIT}/records/${id}`, { fields });
  }
  static async deleteVerfuegbarkeitEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.VERFUEGBARKEIT}/records/${id}`);
  }

}