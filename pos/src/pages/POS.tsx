import { useEffect, useState, useRef, type ElementType } from 'react';
import { t } from '../i18n';
import { Star, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrderPanel from '../components/OrderPanel';
import ProductDialog from '../components/ProductDialog';
import MenuList from '../components/MenuList';
import { usePOSStore, type MenuItem } from '../store/pos-store';
import { cn } from '../lib/utils';
import { Spinner } from '../components/ui/spinner';
import InitialLoader from '../components/InitialLoader';

// QuickFilterButton moved outside component to prevent re-creation on every render
const QuickFilterButton = ({ filter, icon: Icon, label, isActive, isDisabled, onClick }: { 
  filter: 'all' | 'special';
  icon: ElementType;
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    )}
    disabled={isDisabled}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default function POS() {
  const {
    quickFilter,
    setQuickFilter,
    setSelectedItem,
    addToOrder,
    loading,
    error,
    isMenuInteractionDisabled,
    isInitializing,
  } = usePOSStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);

  const handleItemClick = (item: MenuItem) => {
    if (isMenuInteractionDisabled()) return;
    
    clickCountRef.current += 1;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // Single click - add to cart
        addToOrder({ ...item, quantity: 1 });
      } else if (clickCountRef.current === 2) {
        // Double click - open dialog
        setSelectedItem(item);
        setIsDialogOpen(true);
      }
      clickCountRef.current = 0;
    }, 250); // 250ms threshold for double click
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  if (isInitializing) {
    return <InitialLoader />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="max-w-screen-xl mx-auto space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden">
              <QuickFilterButton filter="all" icon={Star} label={t('common.all')} isActive={quickFilter === 'all'} isDisabled={isMenuInteractionDisabled()} onClick={() => setQuickFilter('all')} />
              <QuickFilterButton filter="special" icon={TrendingUp} label={t('menu.special_items')} isActive={quickFilter === 'special'} isDisabled={isMenuInteractionDisabled()} onClick={() => setQuickFilter('special')} />
              </div>
            </div>
          </div>

        <MenuList onItemClick={handleItemClick} />
      </div>
      <OrderPanel />
      {isDialogOpen && <ProductDialog onClose={() => setIsDialogOpen(false)} />}
    </div>
  );
}
