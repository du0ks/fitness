import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard, { CalendarPage, WorkoutsPage } from './pages/Placeholders';
import SessionRunner from './components/session/SessionRunner';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="workouts" element={<WorkoutsPage />} />
        </Route>
        <Route path="/exercise-mode" element={<SessionRunner />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
