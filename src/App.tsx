import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginView } from './components/auth/LoginView';
import { ContractorRestrictionModal } from './components/common/ContractorRestrictionModal';
import { DashboardView } from './views/DashboardView';
import { EffectivenessDashboardView } from './views/EffectivenessDashboardView';
import { PersonnelView } from './views/PersonnelView';
import { AttendanceView } from './views/AttendanceView';
import { RequestsView } from './views/RequestsView';
import { RfidScannerView } from './views/RfidScannerView';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'effectiveness':
        return <EffectivenessDashboardView />;
      case 'personnel':
        return <PersonnelView />;
      case 'attendance':
        return <AttendanceView />;
      case 'requests':
        return <RequestsView />;
      case 'scanner':
        return <RfidScannerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Main Responsive Corporate Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Corporate Navbar with Theme & Session Controls */}
        <Navbar />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Contractor Benefit Restriction Explanatory Modal */}
      <ContractorRestrictionModal />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, login } = useApp();
  // Splash Screen activo por defecto al cargar la app durante 2 segundos
  const [showSplash, setShowSplash] = useState<boolean>(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={(user) => login(user)} />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
