'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Euro,
  ShoppingCart,
  Receipt,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useURYStore } from '@/lib/ury-store';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Paid: 'default',
  Draft: 'secondary',
  Cancelled: 'destructive',
};

const typeIcon: Record<string, string> = {
  'Dine-in': '🍽️',
  Takeaway: '📦',
  Delivery: '🛵',
};

export function OverviewTab() {
  const { kpis, hourlySales, recentOrders, currency, tables, isConnected } = useURYStore();

  // CSV export for recent orders
  const handleExportCSV = () => {
    const headers = ['Račun #', 'Stranka', 'Tip', 'Znesek', 'Status', 'Čas'];
    const rows = recentOrders.map((o) => [
      o.invoice,
      o.customer,
      o.type,
      o.amount.toString(),
      o.status,
      o.time,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `naročila-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate real-time occupancy rate
  const occupancyRate = kpis.totalTables > 0
    ? Math.round((kpis.occupiedTables / kpis.totalTables) * 100)
    : 0;

  // Calculate dine-in vs takeaway split from recent orders
  const dineInCount = recentOrders.filter(o => o.type === 'Dine-in').length;
  const takeawayCount = recentOrders.filter(o => o.type === 'Takeaway').length;
  const deliveryCount = recentOrders.filter(o => o.type === 'Delivery').length;

  // Peak hour from hourly sales
  const peakHour = hourlySales.reduce(
    (max, curr) => (curr.dineIn + curr.takeaway > max.dineIn + max.takeaway ? curr : max),
    hourlySales[0] || { hour: '--:--', dineIn: 0, takeaway: 0 }
  );

  const kpiCards = [
    {
      title: 'Dnevna prodaja',
      value: `${currency}${kpis.dailySales.toLocaleString('sl-SI')}`,
      icon: Euro,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      darkBg: 'dark:bg-emerald-900/20',
    },
    {
      title: 'Skupni naročila',
      value: kpis.totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.3%',
      trendUp: true,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      darkBg: 'dark:bg-amber-900/20',
    },
    {
      title: 'Povprečni račun',
      value: `${currency}${kpis.avgBill.toLocaleString('sl-SI')}`,
      icon: Receipt,
      trend: '-2.1%',
      trendUp: false,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      darkBg: 'dark:bg-rose-900/20',
    },
    {
      title: 'Zasedenost miz',
      value: `${kpis.occupiedTables}/${kpis.totalTables}`,
      icon: UtensilsCrossed,
      trend: `${occupancyRate}%`,
      trendUp: occupancyRate >= 60,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      darkBg: 'dark:bg-violet-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendUp ? TrendingUp : TrendingDown;
          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.darkBg}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <TrendIcon
                    className={`h-3 w-3 mr-1 ${
                      kpi.trendUp ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      kpi.trendUp ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">vs včeraj</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800/30">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Dine-in</p>
              <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{dineInCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-800/30">
              <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Takeaway</p>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{takeawayCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-violet-50/50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-800/30">
              <Receipt className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">Dostava</p>
              <p className="text-lg font-bold text-violet-800 dark:text-violet-300">{deliveryCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/30">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Vrhunec</p>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{peakHour.hour}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium">Zasedenost miz</span>
            </div>
            <span className="text-sm font-bold text-violet-600">{occupancyRate}%</span>
          </div>
          <Progress value={occupancyRate} className="h-2.5" />
          <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
            <span>{kpis.occupiedTables} zasedenih</span>
            <span>{kpis.totalTables - kpis.occupiedTables} prostih</span>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Sales Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Urna prodaja danes</CardTitle>
            <Badge variant="outline" className="text-xs">
              {isConnected ? 'LIVE' : 'DEMO'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDineIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTakeaway" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${currency}${value.toLocaleString('sl-SI')}`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="dineIn"
                  name="Dine-in"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDineIn)"
                />
                <Area
                  type="monotone"
                  dataKey="takeaway"
                  name="Takeaway"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTakeaway)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Zadnja naročila</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-3.5 w-3.5 mr-1" />
                CSV
              </Button>
              <Badge variant="secondary" className="text-xs">
                {recentOrders.length} naročil
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Račun #</TableHead>
                  <TableHead>Stranka</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead className="text-right">Znesek</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Čas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.invoice} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{order.invoice}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <span>{typeIcon[order.type]}</span>
                        <span className="text-sm">{order.type}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {currency}{order.amount.toLocaleString('sl-SI')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{order.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
