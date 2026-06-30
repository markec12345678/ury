'use client';

import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Grid3X3,
  ChefHat,
  TrendingUp,
  Code2,
  Boxes,
  Wallet,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  Wifi,
  ExternalLink,
  BookOpen,
  ShoppingCart,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';

const navigationItems = [
  { id: 'overview', label: 'Pregled', icon: LayoutDashboard, description: 'Dnevni pregled poslovanja' },
  { id: 'tables', label: 'Mize', icon: Grid3X3, description: 'Status miz v restavraciji' },
  { id: 'kitchen', label: 'Kuhinja', icon: ChefHat, description: 'Kuhinjska naročila v realnem času' },
  { id: 'menu', label: 'Jedilnik', icon: BookOpen, description: 'Jedilnik s krožniki in artikli' },
  { id: 'orders', label: 'Naročila', icon: ShoppingCart, description: 'Aktivna naročila in status tracking' },
  { id: 'pl', label: 'P&L', icon: TrendingUp, description: 'Profit & Loss analiza' },
  { id: 'shift', label: 'Smena', icon: Wallet, description: 'Upravljanje smen in blagajn' },
  { id: 'api', label: 'API Explorer', icon: Code2, description: 'URY API končne točke' },
  { id: 'architecture', label: 'Arhitektura', icon: Boxes, description: 'Sistemska arhitektura URY' },
];

const actionItems = [
  { id: 'refresh', label: 'Osveži podatke', icon: RefreshCw, description: 'Ponovno naloži vse podatke iz Frappe' },
  { id: 'toggle-dark', label: 'Preklopi temo', icon: Sun, description: 'Preklop med svetlo in temno temo' },
  { id: 'settings', label: 'Nastavitve', icon: Settings, description: 'Konfiguracija povezave s Frappe' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setActiveTab, toggleDarkMode, darkMode, refreshData, isConnected } = useURYStore();

  // Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  function runCommand(command: () => void) {
    setOpen(false);
    command();
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Išči ukaze, tabe, dejanja..." />
      <CommandList>
        <CommandEmpty>Ni zadetkov</CommandEmpty>
        <CommandGroup heading="Navigacija">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(() => setActiveTab(item.id))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <div>
                <span className="font-medium">{item.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Dejanja">
          <CommandItem
            onSelect={() => runCommand(() => {
              if (isConnected) refreshData();
            })}
            disabled={!isConnected}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <div>
              <span className="font-medium">Osveži podatke</span>
              <span className="ml-2 text-xs text-muted-foreground">Ponovno naloži vse podatke</span>
            </div>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => toggleDarkMode())}
          >
            {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <div>
              <span className="font-medium">{darkMode ? 'Svetla tema' : 'Temna tema'}</span>
              <span className="ml-2 text-xs text-muted-foreground">Preklopi videz dashboarda</span>
            </div>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => window.location.href = '/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            <div>
              <span className="font-medium">Nastavitve</span>
              <span className="ml-2 text-xs text-muted-foreground">Konfiguracija povezave</span>
            </div>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Povezave">
          <CommandItem
            onSelect={() => runCommand(() => window.open('https://github.com/markec12345678/ury', '_blank'))}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <div>
              <span className="font-medium">URY GitHub</span>
              <span className="ml-2 text-xs text-muted-foreground">Izvorna koda projekta</span>
            </div>
          </CommandItem>
          {isConnected && (
            <CommandItem
              onSelect={() => runCommand(() => {
                const config = localStorage.getItem('ury_frappe_config');
                if (config) {
                  const { baseUrl } = JSON.parse(config);
                  if (baseUrl) window.open(baseUrl, '_blank');
                }
              })}
            >
              <Wifi className="mr-2 h-4 w-4" />
              <div>
                <span className="font-medium">Odpri Frappe</span>
                <span className="ml-2 text-xs text-muted-foreground">Odpri Frappe/ERPNext v novem zavihku</span>
              </div>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
