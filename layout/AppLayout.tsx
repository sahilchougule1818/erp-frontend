import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LabProvider } from '../indoor/contexts/LabContext';
import { Sidebar } from './Sidebar';
import { ContentTopBar } from './ContentTopBar';
import { getRouteMeta, isIndoorRoute } from '../routes/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const routeMeta = getRouteMeta(location.pathname);
  const showIndoorLab = isIndoorRoute(location.pathname);

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const shell = (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        currentPage={routeMeta.page}
        onNavigate={(page) => handleNavigate(page)}
        user={user}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 pr-3 py-3 bg-white">
        <ContentTopBar showIndoorLab={showIndoorLab} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );

  if (showIndoorLab) {
    return <LabProvider>{shell}</LabProvider>;
  }

  return shell;
}
