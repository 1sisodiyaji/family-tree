import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { FamilyTreePage } from './pages/FamilyTree'
import { PlotDetail } from './pages/PlotDetail'
import { PlotForm } from './pages/PlotForm'
import { PlotsList } from './pages/PlotsList'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plots" element={<PlotsList />} />
          <Route path="plots/new" element={<PlotForm />} />
          <Route path="plots/:id" element={<PlotDetail />} />
          <Route path="plots/:id/edit" element={<PlotForm />} />
          <Route path="family" element={<FamilyTreePage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
