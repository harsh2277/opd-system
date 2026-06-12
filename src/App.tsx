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
import { DoctorDashboard } from './screens/DoctorDashboard';
import { DoctorPatientDetails } from './screens/DoctorPatientDetails';
import { PharmacyDashboardPage } from './screens/PharmacyDashboardPage';
import { LabDashboardPage } from './screens/LabDashboardPage';
import { AdminDashboard } from './screens/admin/AdminDashboard';
import { AdminUsers } from './screens/admin/AdminUsers';
import { AdminReports } from './screens/admin/AdminReports';
import { AdminSettings } from './screens/admin/AdminSettings';
import { AdminBilling } from './screens/admin/AdminBilling';
import { AdminAddUser } from './screens/admin/AdminAddUser';
import { BillingManagement } from './screens/BillingManagement';
import { Appointments } from './screens/Appointments';
import { UiShowcase } from './screens/UiShowcase';
import { ProtectedRoute } from './components/ProtectedRoute';

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
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <ReceptionDashboard />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <PatientManagement />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-type"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <PatientTypeSelector />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-patient"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <NewPatientForm />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/returning-patient"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <ReturningPatientSearch />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-selection"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <DoctorSelection />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/token-receipt"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <TokenReceipt />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <QueueManagement />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <BillingManagement />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute role="reception">
                <DesktopLayout>
                  <Appointments />
                </DesktopLayout>
              </ProtectedRoute>
            }
          />
          {/* TV Display - Full Screen, No Layout */}
          <Route path="/display" element={<TVDisplay />} />
          <Route path="/display-debug" element={<TVDisplayDebug />} />

          {/* UI Showcase - Standalone */}
          <Route path="/ui" element={<UiShowcase />} />

          {/* Doctor Routes - Full Screen, No Desktop Layout */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-patient/:tokenId"
            element={
              <ProtectedRoute role="doctor">
                <DoctorPatientDetails />
              </ProtectedRoute>
            }
          />

          {/* Pharmacy Routes - Full Screen, No Desktop Layout */}
          <Route
            path="/pharmacy-dashboard"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Lab Routes - Full Screen, No Desktop Layout */}
          <Route
            path="/lab-dashboard"
            element={
              <ProtectedRoute role="lab">
                <LabDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminAddUser />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminBilling />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
