'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Clock,
  User,
  MapPin,
  ChefHat,
  CheckCircle2,
  XCircle,
  Truck,
  UtensilsCrossed,
  Wifi,
  WifiOff,
  Filter,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';
import type { ActiveOrder, ActiveOrderStatus } from '@/lib/ury-types';

const statusConfig: Record<ActiveOrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Na čakanju', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-300', icon: Clock },
  confirmed: { label: 'Potrjeno', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300', icon: CheckCircle2 },
  preparing: { label: 'V pripravi', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300', icon: ChefHat },
  ready: { label: 'Pripravljeno', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300', icon: CheckCircle2 },
  served: { label: 'Postreženo', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: UtensilsCrossed },
  cancelled: { label: 'Preklicano', color: 'text-red-700', bg: 'bg-red-50 border-red-300', icon: XCircle },
};

const itemStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Čaka', color: 'text-gray-500' },
  preparing: { label: 'V pripravi', color: 'text-amber-600' },
  ready: { label: 'Pripravljeno', color: 'text-emerald-600' },
  served: { label: 'Postreženo', color: 'text-green-600' },
};

export function OrdersTab() {
  const { activeOrders, currency, isConnected } = useURYStore();
  const [statusFilter, setStatusFilter] = useState<ActiveOrderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    let orders = activeOrders;
    if (statusFilter !== 'all') {
      orders = orders.filter((o) => o.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      orders = orders.filter((o) => o.type === typeFilter);
    }
    return orders;
  }, [activeOrders, statusFilter, typeFilter]);

  // Summary counts
  const pendingCount = activeOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const preparingCount = activeOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = activeOrders.filter((o) => o.status === 'ready').length;
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs text-amber-600 font-medium">Na čakanju</p>
              <p className="text-xl font-bold text-amber-800">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-3 flex items-center gap-3">
            <ChefHat className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-xs text-orange-600 font-medium">V pripravi</p>
              <p className="text-xl font-bold text-orange-800">{preparingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">Pripravljeno</p>
              <p className="text-xl font-bold text-emerald-800">{readyCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-3 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-xs text-violet-600 font-medium">Skupaj promet</p>
              <p className="text-xl font-bold text-violet-800">{currency}{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className={statusFilter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            onClick={() => setStatusFilter('all')}
          >
            Vse ({activeOrders.length})
          </Button>
          {(['confirmed', 'preparing', 'ready', 'served'] as ActiveOrderStatus[]).map((status) => {
            const config = statusConfig[status];
            const count = activeOrders.filter((o) => o.status === status).length;
            const Icon = config.icon;
            return (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                className={statusFilter === status ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => setStatusFilter(status)}
              >
                <Icon className="h-3.5 w-3.5 mr-1" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs flex items-center gap-1.5">
            {isConnected ? (
              <><Wifi className="h-3 w-3 text-emerald-500" /> Live</>
            ) : (
              <><WifiOff className="h-3 w-3 text-gray-400" /> Simulacija</>
            )}
          </Badge>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2">
        {['all', 'Dine-in', 'Takeaway', 'Delivery'].map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => setTypeFilter(type)}
          >
            {type === 'all' ? 'Vsi tipi' : type === 'Dine-in' ? '🍽 Na mestu' : type === 'Takeaway' ? '🥡 Za odnos' : '🚚 Dostava'}
          </Button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} currency={currency} />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Ni aktivnih naročil</p>
          <p className="text-sm">Naročila bodo prikazana tukaj, ko bodo ustvarjena</p>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, currency }: { order: ActiveOrder; currency: string }) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const getElapsedColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 15) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <Card className={`border-2 ${config.bg} transition-all hover:shadow-md`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{order.invoiceNo}</span>
            <Badge variant="outline" className={`${config.color} ${config.bg} text-[10px]`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className={`h-4 w-4 ${getElapsedColor(order.elapsed)}`} />
            <span className={`text-sm font-mono font-bold ${getElapsedColor(order.elapsed)}`}>
              {order.elapsed} min
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {order.customer}
          </span>
          {order.table && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Miza {order.table}
            </span>
          )}
          <Badge variant="outline" className="text-[10px]">
            {order.type === 'Dine-in' ? 'Na mestu' : order.type === 'Takeaway' ? 'Za odnos' : 'Dostava'}
          </Badge>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-1.5">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {item.qty}
                </span>
                <span>{item.name}</span>
                {item.course && (
                  <span className="text-[10px] text-muted-foreground">{item.course}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{currency}{(item.price * item.qty).toLocaleString('en-IN')}</span>
                {item.status && (
                  <span className={`text-[10px] font-medium ${itemStatusConfig[item.status]?.color || 'text-gray-500'}`}>
                    {itemStatusConfig[item.status]?.label || item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {order.items.some((item) => item.comments) && (
            <div className="mt-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
              {order.items.filter((i) => i.comments).map((i) => i.comments).join(', ')}
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Blagajnik: {order.cashier}</span>
          <span className="text-base font-bold">
            {currency}{order.total.toLocaleString('en-IN')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
