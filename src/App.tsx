import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MoodProvider } from './store/MoodContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import RecordDetailPage from './pages/RecordDetailPage/RecordDetailPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

export default function App() {
  return (
    <MoodProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/record/:id" element={<RecordDetailPage />} />
        </Routes>
      </BrowserRouter>
    </MoodProvider>
  );
}
