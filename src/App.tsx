import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import SchichtvorlagenPage from '@/pages/SchichtvorlagenPage';
import SchichtzuweisungenPage from '@/pages/SchichtzuweisungenPage';
import MitarbeiterPage from '@/pages/MitarbeiterPage';
import VerfuegbarkeitPage from '@/pages/VerfuegbarkeitPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="schichtvorlagen" element={<SchichtvorlagenPage />} />
          <Route path="schichtzuweisungen" element={<SchichtzuweisungenPage />} />
          <Route path="mitarbeiter" element={<MitarbeiterPage />} />
          <Route path="verfuegbarkeit" element={<VerfuegbarkeitPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}