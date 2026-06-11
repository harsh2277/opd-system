import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { DesktopLayout } from './components/DesktopLayout';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { ReceptionDashboard } from './screens/ReceptionDashboard';
import { PatientManagement } from './screens/PatientManagement';

import { PatientTypeSelector } from './screens/PatientTypeSelector';
import { NewPatientForm } from './screens/NewPatientForm';
import { ReturningPatientSearch } from './screens/ReturningPatientSearch';
import { DoctorSelection } from './screens/DoctorSelection';
import { TokenReceipt } from './screens/TokenReceipt';
import { QueueManagement } from './screens/QueueManagement';
import { TVDisplay } from './screens/TVDisplay';
import { TVDisplayDebug } from './screens/TVDisplayDebug';
import { DoctorDashboardNew } from './screens/DoctorDashboardNew';
import { DoctorPatientDetails } from './screens/DoctorPatientDetails';
import { PharmacyDashboardPage } from './screens/PharmacyDashboardPage';
import { LabDashboardPage } from './screens/LabDashboardPage';
import { AdminDashboard } from './screens/admin/AdminDashboard';
import { AdminUsers } from './screens/admin/AdminUsers';
import { AdminReports } from './screens/admin/AdminReports';
import { AdminSettings } from './screens/admin/AdminSettings';
import { AdminBilling } from './screens/admin/AdminBilling';
import { AdminAddUser } from './screens/admin/AdminAddUser';
import { UiShowcase } from './screens/UiShowcase';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Login Route - No Layout */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes - With Desktop Layout */}
          <Route
            path="/dashboard"
            element={
              <DesktopLayout>
                <ReceptionDashboard />
              </DesktopLayout>
            }
          />
          <Route
            path="/patients"
            element={
              <DesktopLayout>
                <PatientManagement />
              </DesktopLayout>
            }
          />
          <Route
            path="/patient-type"
            element={
              <DesktopLayout>
                <PatientTypeSelector />
              </DesktopLayout>
            }
          />
          <Route
            path="/new-patient"
            element={
              <DesktopLayout>
                <NewPatientForm />
              </DesktopLayout>
            }
          />
          <Route
            path="/returning-patient"
            element={
              <DesktopLayout>
                <ReturningPatientSearch />
              </DesktopLayout>
            }
          />
          <Route
            path="/doctor-selection"
            element={
              <DesktopLayout>
                <DoctorSelection />
              </DesktopLayout>
            }
          />
          <Route
            path="/token-receipt"
            element={
              <DesktopLayout>
                <TokenReceipt />
              </DesktopLayout>
            }
          />
          <Route
            path="/queue"
            element={
              <DesktopLayout>
                <QueueManagement />
              </DesktopLayout>
            }
          />
          {/* TV Display - Full Screen, No Layout */}
          <Route path="/display" element={<TVDisplay />} />
          <Route path="/display-debug" element={<TVDisplayDebug />} />

          {/* UI Showcase - Standalone */}
          <Route path="/ui" element={<UiShowcase />} />

          {/* Doctor Routes - Full Screen, No Desktop Layout */}
          <Route path="/doctor-dashboard" element={<DoctorDashboardNew />} />
          <Route path="/doctor-patient/:tokenId" element={<DoctorPatientDetails />} />

          {/* Pharmacy Routes - Full Screen, No Desktop Layout */}
          <Route path="/pharmacy-dashboard" element={<PharmacyDashboardPage />} />

          {/* Lab Routes - Full Screen, No Desktop Layout */}
          <Route path="/lab-dashboard" element={<LabDashboardPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <AdminLayout>
                <AdminAddUser />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <AdminLayout>
                <AdminBilling />
              </AdminLayout>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
