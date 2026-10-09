import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './views/DashboardView';
import { ExecutiveBiDashboardView } from './views/ExecutiveBiDashboardView';
import { EconomicImpactView } from './views/EconomicImpactView';
import { AreaIncidencesView } from './views/AreaIncidencesView';
import { EffectivenessDashboardView } from './views/EffectivenessDashboardView';
import { PersonnelView } from './views/PersonnelView';
import { AttendanceView } from './views/AttendanceView';
import { RequestsView } from './views/RequestsView';
import { PayrollDeductionsView } from './views/PayrollDeductionsView';

const MainLayout: React.FC = () => {
  const { currentView, adminRole } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      // Vistas de Business Intelligence (Gerencia)
      case 'dashboard_bi':
        return <ExecutiveBiDashboardView />;
      case 'economic_impact':
        return <EconomicImpactView />;
      case 'incidences':
        return <AreaIncidencesView />;

      // Vistas Operativas (Recursos Humanos)
      case 'dashboard':
        return <DashboardView />;
      case 'personnel':
        return <PersonnelView />;
      case 'attendance':
        return <AttendanceView />;
      case 'requests':
        return <RequestsView />;
      case 'payroll_deductions':
        return <PayrollDeductionsView />;

      // Vistas Compartidas de Auditoría
      case 'effectiveness':
        return <EffectivenessDashboardView />;

      default:
        return adminRole === 'GERENCIA' ? <ExecutiveBiDashboardView /> : <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Corporativo con menús específicos según el rol */}
      <Sidebar />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10 bg-slate-50">
        {/* Navbar con Conmutador de Entorno (Gerencia BI / RRHH) */}
        <Navbar />

        {/* Contenedor Dinámico de la Vista */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, login } = useApp();
  // Splash Screen activo por defecto al cargar la app durante 1.2 segundos
  const [showSplash, setShowSplash] = useState<boolean>(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={(email, role) => login(email, role)} />;
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
