import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import AuthGuard from './components/AuthGuard';
import POSOpeningProvider from './components/POSOpeningProvider';
import ScreenSizeProvider from './components/ScreenSizeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { SkipToContent } from './components/SkipToContent';
import { NetworkStatus } from './components/NetworkStatus';
import { ToastProvider } from './components/ui/toast';
import { usePOSStore } from './store/pos-store';
import { Spinner } from './components/ui/spinner';
import { getActiveLanguage, getActiveDirection, t } from './i18n';
import { registerServiceWorker } from './lib/sw-register';
import { shortcutRegistry } from './lib/keyboard-shortcuts';

const POS = lazy(() => import('./pages/POS'));
const Orders = lazy(() => import('./pages/Orders'));
const Table = lazy(() => import('./pages/Table'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const Reports = lazy(() => import('./pages/Reports'));

/** Registers global keyboard shortcuts for navigation */
function GlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Map routes to scopes for shortcut activation
    const scopeMap: Record<string, string> = {
      '/': 'pos',
      '/orders': 'orders',
      '/table': 'pos',
      '/dashboard': 'dashboard',
      '/menu-management': 'menu-management',
      '/reports': 'reports',
    };
    const scope = (scopeMap[location.pathname] || 'global') as
      'pos' | 'orders' | 'dashboard' | 'menu-management' | 'reports' | 'global';
    shortcutRegistry.setScope(scope);
  }, [location.pathname]);

  useEffect(() => {
    // Register global navigation shortcuts
    shortcutRegistry.register({
      id: 'nav-pos',
      key: '1',
      modifiers: ['alt'],
      description: 'Navigate to POS',
      scope: 'global',
      handler: () => navigate('/'),
    });
    shortcutRegistry.register({
      id: 'nav-orders',
      key: '2',
      modifiers: ['alt'],
      description: 'Navigate to Orders',
      scope: 'global',
      handler: () => navigate('/orders'),
    });
    shortcutRegistry.register({
      id: 'nav-table',
      key: '3',
      modifiers: ['alt'],
      description: 'Navigate to Tables',
      scope: 'global',
      handler: () => navigate('/table'),
    });
    shortcutRegistry.register({
      id: 'nav-dashboard',
      key: '4',
      modifiers: ['alt'],
      description: 'Navigate to Dashboard',
      scope: 'global',
      handler: () => navigate('/dashboard'),
    });
    shortcutRegistry.register({
      id: 'nav-menu-mgmt',
      key: '5',
      modifiers: ['alt'],
      description: 'Navigate to Menu Management',
      scope: 'global',
      handler: () => navigate('/menu-management'),
    });
    shortcutRegistry.register({
      id: 'nav-reports',
      key: '6',
      modifiers: ['alt'],
      description: 'Navigate to Reports',
      scope: 'global',
      handler: () => navigate('/reports'),
    });

    return () => {
      shortcutRegistry.unregister('nav-pos');
      shortcutRegistry.unregister('nav-orders');
      shortcutRegistry.unregister('nav-table');
      shortcutRegistry.unregister('nav-dashboard');
      shortcutRegistry.unregister('nav-menu-mgmt');
      shortcutRegistry.unregister('nav-reports');
    };
  }, [navigate]);

  return null;
}

/** R39-FIX: Wrap each route with its own ErrorBoundary so that a render crash
 *  in one page doesn't take down the entire app (navigation, header, etc.).
 *  Previously a single ErrorBoundary wrapped all routes, meaning any unhandled
 *  error in a page component would blank the whole screen including the footer
 *  navigation — users had no way to navigate away. Now each page isolates its
 *  errors and the user can still navigate to other pages.
 */
function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

function App() {
  // R41-FIX: Use individual Zustand selector instead of usePOSStore()
  // which subscribes to ALL state changes in the POS store.
  const initializeApp = usePOSStore((s) => s.initializeApp);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // R42-FIX: Re-run dir/lang update when language changes. Previously this only
  // ran on mount with [], so switching to an RTL language (e.g. Arabic) at runtime
  // would not update the document direction. We use a simple interval check since
  // the i18n module doesn't emit events. This runs infrequently and is cheap.
  useEffect(() => {
    const update = () => {
      document.documentElement.dir = getActiveDirection();
      document.documentElement.lang = getActiveLanguage() || 'en';
    };
    update();
    const id = setInterval(update, 2000);
    return () => clearInterval(id);
  }, []);

  // Register service worker for PWA support
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return (
    <>
      <ToastProvider />
      <NetworkStatus />
      <ScreenSizeProvider>
        <AuthGuard>
          <POSOpeningProvider>
            <Router basename="/pos">
              <ErrorBoundary>
                <GlobalShortcuts />
                <SkipToContent />
                <div
                  className="flex flex-col h-screen bg-gray-100 font-inter"
                  data-testid="app-layout"
                >
                  <Header />
                  <div id="main-content" className="flex-1 overflow-hidden" tabIndex={-1}>
                    <Suspense
                      fallback={
                        <div
                          className="flex items-center justify-center h-full"
                          role="status"
                          aria-label={t('common.loading')}
                        >
                          <div className="text-center">
                            <Spinner />
                            <p className="mt-3 text-sm text-gray-500">{t('common.loading')}</p>
                          </div>
                        </div>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<RouteErrorBoundary><POS /></RouteErrorBoundary>} />
                        <Route path="/orders" element={<RouteErrorBoundary><Orders /></RouteErrorBoundary>} />
                        <Route path="/table" element={<RouteErrorBoundary><Table /></RouteErrorBoundary>} />
                        <Route path="/dashboard" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />
                        <Route path="/menu-management" element={<RouteErrorBoundary><MenuManagement /></RouteErrorBoundary>} />
                        <Route path="/reports" element={<RouteErrorBoundary><Reports /></RouteErrorBoundary>} />
                      </Routes>
                    </Suspense>
                  </div>
                  <Footer />
                </div>
              </ErrorBoundary>
            </Router>
          </POSOpeningProvider>
        </AuthGuard>
      </ScreenSizeProvider>
    </>
  );
}

export default App;
