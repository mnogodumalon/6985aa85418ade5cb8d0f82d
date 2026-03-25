import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import VerfuegbarkeitPage from '@/pages/VerfuegbarkeitPage';
import MitarbeiterPage from '@/pages/MitarbeiterPage';
import SchichtzuweisungenPage from '@/pages/SchichtzuweisungenPage';
import SchichtvorlagenPage from '@/pages/SchichtvorlagenPage';

export default function App() {
  return (
    <HashRouter>
      <ActionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="verfuegbarkeit" element={<VerfuegbarkeitPage />} />
            <Route path="mitarbeiter" element={<MitarbeiterPage />} />
            <Route path="schichtzuweisungen" element={<SchichtzuweisungenPage />} />
            <Route path="schichtvorlagen" element={<SchichtvorlagenPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ActionsProvider>
    </HashRouter>
  );
}
