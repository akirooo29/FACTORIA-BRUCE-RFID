import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ContractorRestrictionModal } from './components/common/ContractorRestrictionModal';
import { DashboardView } from './views/DashboardView';
import { EffectivenessDashboardView } from './views/EffectivenessDashboardView';
import { PersonnelView } from './views/PersonnelView';
import { AttendanceView } from './views/AttendanceView';
import { RequestsView } from './views/RequestsView';

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
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans transition-colors">
      {/* Main Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Corporate Navbar with Theme Toggle */}
        <Navbar />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Contractor Benefit Restriction Explanatory Modal */}
      <ContractorRestrictionModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
