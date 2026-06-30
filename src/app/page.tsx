'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Grid3X3,
  ChefHat,
  TrendingUp,
  Code2,
  Boxes,
  Wallet,
  Settings,
  Menu,
  X,
  Clock,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  User,
  RefreshCw,
} from 'lucide-react';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { TablesTab } from '@/components/dashboard/tables-tab';
import { KitchenTab } from '@/components/dashboard/kitchen-tab';
import { PLTab } from '@/components/dashboard/pl-tab';
import { APIExplorerTab } from '@/components/dashboard/api-explorer-tab';
import { ArchitectureTab } from '@/components/dashboard/architecture-tab';
import { ShiftTab } from '@/components/dashboard/shift-tab';
import { NotificationCenter } from '@/components/dashboard/notification-center';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { useURYStore } from '@/lib/ury-store';

const tabs = [
  { id: 'overview', label: 'Pregled', icon: LayoutDashboard },
  { id: 'tables', label: 'Mize', icon: Grid3X3 },
  { id: 'kitchen', label: 'Kuhinja', icon: ChefHat },
  { id: 'pl', label: 'P&L', icon: TrendingUp },
  { id: 'shift', label: 'Smena', icon: Wallet },
  { id: 'api', label: 'API', icon: Code2 },
  { id: 'architecture', label: 'Arhitektura', icon: Boxes },
];

const fadeVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    darkMode,
    toggleDarkMode,
    isConnected,
    authenticatedUser,
    restaurantName,
    lastRefreshed,
    isRefreshing,
    refreshData,
    kotCards,
    tables,
  } = useURYStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍽️</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">URY Dashboard</h1>
              <p className="text-xs text-gray-400">Restaurant Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-gray-700" />

        {/* Restaurant Info + Connection */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-emerald-400">{restaurantName}</p>
            <Badge className={`text-[10px] px-1.5 py-0 h-4 ${
              isConnected
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}>
              {isConnected ? 'LIVE' : 'DEMO'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {isConnected ? 'Povezano s Frappe' : 'Simulirani podatki'}
          </p>
        </div>

        <Separator className="bg-gray-700" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                  {tab.id === 'kitchen' && kotCards.filter(k => k.status !== 'served' && k.status !== 'cancelled').length > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0 h-5">
                      {kotCards.filter(k => k.status !== 'served' && k.status !== 'cancelled').length}
                    </Badge>
                  )}
                  {tab.id === 'tables' && tables.filter(t => t.status !== 'free').length > 0 && (
                    <Badge className="ml-auto bg-amber-500 text-white text-[10px] px-1.5 py-0 h-5">
                      {tables.filter(t => t.status !== 'free').length}/{tables.length}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Settings link */}
          <Separator className="bg-gray-700 my-3" />
          <a
            href="/settings"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <Settings className="h-4.5 w-4.5" />
            Nastavitve
          </a>
        </ScrollArea>

        <Separator className="bg-gray-700" />

        {/* Footer */}
        <div className="p-4 space-y-2">
          {isConnected && authenticatedUser && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{authenticatedUser}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{timeStr} • {dateStr}</span>
          </div>
          <p className="text-[10px] text-gray-600">URY v2.0 • Frappe/ERPNext</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {activeTab === 'overview' && 'Dnevni pregled poslovanja'}
                {activeTab === 'tables' && 'Status miz v restavraciji — real-time posodobitve'}
                {activeTab === 'kitchen' && 'Kuhinjska naročila v realnem času'}
                {activeTab === 'pl' && 'Profit & Loss analiza'}
                {activeTab === 'shift' && 'Upravljanje smen in blagajn'}
                {activeTab === 'api' && 'URY API končne točke'}
                {activeTab === 'architecture' && 'Sistemska arhitektura URY'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs hidden sm:flex">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-500 mr-1.5" />
                  Povezano
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-amber-500 mr-1.5" />
                  Demo
                </>
              )}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs hidden lg:flex cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => {
                // Trigger command palette via keyboard event
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
                document.dispatchEvent(event);
              }}
              title="Odpri ukazno paleto (⌘K)"
            >
              <span className="text-muted-foreground mr-1">⌘</span>K
            </Badge>
            {isConnected && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => refreshData()}
                disabled={isRefreshing}
                title={lastRefreshed ? `Zadnja osvežitev: ${lastRefreshed.toLocaleTimeString('sl-SI')}` : 'Osveži podatke'}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => window.location.href = '/settings'}
              title="Nastavitve"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleDarkMode}
              title={darkMode ? 'Svetla tema' : 'Temna tema'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Tabs (visible on small screens) */}
          <div className="lg:hidden mb-4 overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-muted">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-xs px-3">
                    <tab.icon className="h-3.5 w-3.5 mr-1" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Desktop Tabs (visible on large screens) */}
          <div className="hidden lg:block mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted dark:bg-gray-800">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="px-4">
                    <tab.icon className="h-4 w-4 mr-1.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Animated Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={fadeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'tables' && <TablesTab />}
              {activeTab === 'kitchen' && <KitchenTab />}
              {activeTab === 'pl' && <PLTab />}
              {activeTab === 'shift' && <ShiftTab />}
              {activeTab === 'api' && <APIExplorerTab />}
              {activeTab === 'architecture' && <ArchitectureTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette />
    </div>
  );
}
