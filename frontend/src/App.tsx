import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ClubsPage } from './pages/ClubsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlayersPage } from './pages/PlayersPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/players" replace />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="clubs" element={<ClubsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
