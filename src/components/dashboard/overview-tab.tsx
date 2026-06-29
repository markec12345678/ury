'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  IndianRupee,
  ShoppingCart,
  Receipt,
  UtensilsCrossed,
  TrendingUp,
} from 'lucide-react';
import { kpiData, hourlySalesData, recentOrders, CURRENCY } from '@/lib/mock-data';

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
  const kpis = [
    {
      title: 'Dnevna prodaja',
      value: `${CURRENCY}${kpiData.dailySales.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Skupni naročila',
      value: kpiData.totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.3%',
      trendUp: true,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Povprečni račun',
      value: `${CURRENCY}${kpiData.avgBill.toLocaleString('en-IN')}`,
      icon: Receipt,
      trend: '-2.1%',
      trendUp: false,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'Zasedene mize',
      value: `${kpiData.occupiedTables}/${kpiData.totalTables}`,
      icon: UtensilsCrossed,
      trend: '75%',
      trendUp: true,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-center pt-2">
                <TrendingUp className={`h-3 w-3 mr-1 ${kpi.trendUp ? 'text-emerald-500' : 'text-rose-500'} ${!kpi.trendUp ? 'rotate-180' : ''}`} />
                <span className={`text-xs font-medium ${kpi.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {kpi.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs včeraj</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hourly Sales Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Urna prodaja danes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`${CURRENCY}${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="dineIn" name="Dine-in" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorDineIn)" />
                <Area type="monotone" dataKey="takeaway" name="Takeaway" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTakeaway)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Zadnja naročila</CardTitle>
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
                  <TableRow key={order.invoice}>
                    <TableCell className="font-mono text-sm">{order.invoice}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <span>{typeIcon[order.type]}</span>
                        <span className="text-sm">{order.type}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{CURRENCY}{order.amount.toLocaleString('en-IN')}</TableCell>
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
