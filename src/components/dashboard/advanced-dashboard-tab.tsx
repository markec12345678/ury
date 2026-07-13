'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Euro,
  ShoppingCart,
  Receipt,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Leaf,
  Flame,
  Zap,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Download,
  RefreshCw,
  Timer,
  ChefHat,
  UserCheck,
  Gauge,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';
import type { DashboardPeriod } from '@/lib/ury-types';

const periodLabels: Record<DashboardPeriod, string> = {
  today: 'Danes',
  yesterday: 'Včeraj',
  week: '7 dni',
  month: '30 dni',
  quarter: 'Kvartal',
};

// ── Mock data for Staff Performance ──────────────────────
const mockStaffData = [
  { name: 'Ana M.', ordersServed: 47, avgPrepTime: 12, rating: 4.8 },
  { name: 'Marko R.', ordersServed: 42, avgPrepTime: 14, rating: 4.6 },
  { name: 'Luka S.', ordersServed: 38, avgPrepTime: 11, rating: 4.7 },
  { name: 'Maja P.', ordersServed: 35, avgPrepTime: 15, rating: 4.5 },
  { name: 'Petar K.', ordersServed: 31, avgPrepTime: 13, rating: 4.4 },
];

const mockStaffMetrics = {
  topWaiter: 'Ana M.',
  topWaiterOrders: 47,
  avgPrepTime: 13,
  kitchenThroughput: 24,
};

// ── Mock data for Wait Time Analytics ────────────────────
const mockWaitTimeData = {
  avgOrderToServe: 18,
  currentQueueLength: 5,
  peakWaitTimeToday: 32,
  targetWaitTime: 20,
};

const mockWaitTimeHistory = [
  { hour: '10:00', waitTime: 12 },
  { hour: '11:00', waitTime: 15 },
  { hour: '12:00', waitTime: 22 },
  { hour: '13:00', waitTime: 28 },
  { hour: '14:00', waitTime: 18 },
  { hour: '15:00', waitTime: 10 },
  { hour: '16:00', waitTime: 8 },
  { hour: '17:00', waitTime: 14 },
  { hour: '18:00', waitTime: 20 },
  { hour: '19:00', waitTime: 25 },
  { hour: '20:00', waitTime: 30 },
  { hour: '21:00', waitTime: 22 },
  { hour: '22:00', waitTime: 15 },
];

// ── Mock data for Category Breakdown ─────────────────────
const mockCategoryBreakdown = [
  { day: 'Pon', Predjedi: 320, Glavne: 890, Sladice: 210, Pijača: 450 },
  { day: 'Tor', Predjedi: 280, Glavne: 780, Sladice: 190, Pijača: 410 },
  { day: 'Sre', Predjedi: 350, Glavne: 920, Sladice: 240, Pijača: 480 },
  { day: 'Čet', Predjedi: 310, Glavne: 850, Sladice: 220, Pijača: 430 },
  { day: 'Pet', Predjedi: 420, Glavne: 1100, Sladice: 310, Pijača: 620 },
  { day: 'Sob', Predjedi: 480, Glavne: 1250, Sladice: 350, Pijača: 700 },
  { day: 'Ned', Predjedi: 390, Glavne: 980, Sladice: 280, Pijača: 550 },
];

const REFRESH_INTERVAL = 30; // seconds

// ── Dark mode aware tooltip style helper ─────────────────
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches || document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function getTooltipStyle(isDark: boolean) {
  return {
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    fontSize: '13px',
    backgroundColor: isDark ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
    color: isDark ? '#f3f4f6' : '#111827',
  };
}

// ── Circular Progress Component ──────────────────────────
function CircularTimer({ seconds, total }: { seconds: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="44" height="44" className="-rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/20"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-1000"
        />
      </svg>
      <span className="absolute text-[10px] font-bold tabular-nums">{seconds}s</span>
    </div>
  );
}

// ── Gauge Component ──────────────────────────────────────
function WaitTimeGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max * 0.8;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-sm font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
          {value} min
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? '#ef4444' : color,
          }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/50"
          style={{ left: `${(max * 0.8 / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function AdvancedDashboardTab() {
  const {
    dashboardPeriod,
    dashboardMetrics,
    salesTrend,
    topSellingItems,
    paymentSplit,
    hourlyHeatmap,
    currency,
    setDashboardPeriod,
    isConnected,
    lastRefreshed,
    refreshData,
  } = useURYStore();

  const metrics = dashboardMetrics;
  const isDark = useIsDark();

  // ── Auto-refresh timer ────────────────────────────────
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;
    if (countdown === REFRESH_INTERVAL) {
      // Timer just reset, trigger refresh
      const doRefresh = async () => {
        setIsRefreshing(true);
        try {
          await refreshData();
        } finally {
          setIsRefreshing(false);
        }
      };
      doRefresh();
    }
  }, [countdown, isConnected, refreshData]);

  // ── CSV Export ─────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const rows: string[][] = [];

    // KPI metrics
    rows.push(['=== KLJUČNI KAZALNIKI ===']);
    rows.push(['Kazalnik', 'Vrednost', 'Rast (%)']);
    rows.push(['Skupni prihodki', metrics.totalRevenue.toString(), metrics.revenueGrowth.toFixed(1)]);
    rows.push(['Skupna naročila', metrics.totalOrders.toString(), metrics.ordersGrowth.toFixed(1)]);
    rows.push(['Povprečni račun', metrics.avgOrderValue.toString(), metrics.avgOrderGrowth.toFixed(1)]);
    rows.push(['Zasedenost miz', metrics.occupancyRate.toString(), metrics.occupancyGrowth.toFixed(1)]);
    rows.push([]);

    // Sales trend
    rows.push(['=== TREND PRODAJE ===']);
    rows.push(['Oznaka', 'Prihodki', 'Naročila']);
    salesTrend.forEach((p) => rows.push([p.label, p.revenue.toString(), p.orders.toString()]));
    rows.push([]);

    // Top selling items
    rows.push(['=== NAJBOLJ PRODAJANI ===']);
    rows.push(['Naziv', 'Količina', 'Prihodki', 'Kategorija', 'Vegetariansko']);
    topSellingItems.forEach((item) =>
      rows.push([item.name, item.quantity.toString(), item.revenue.toString(), item.course, item.isVeg ? 'Da' : 'Ne'])
    );
    rows.push([]);

    // Payment split
    rows.push(['=== NAČINI PLAČILA ===']);
    rows.push(['Način', 'Število', 'Znesek']);
    paymentSplit.forEach((p) => rows.push([p.method, p.count.toString(), p.amount.toString()]));
    rows.push([]);

    // Staff performance
    rows.push(['=== USPEŠNOST OSEBJA ===']);
    rows.push(['Ime', 'Naročila', 'Povp. čas priprave (min)', 'Ocena']);
    mockStaffData.forEach((s) =>
      rows.push([s.name, s.ordersServed.toString(), s.avgPrepTime.toString(), s.rating.toString()])
    );
    rows.push([]);

    // Wait time
    rows.push(['=== ČASI ČAKANJA ===']);
    rows.push(['Povp. čas (min)', 'Trenutna čakalna vrsta', 'Vršni čas danes (min)']);
    rows.push([
      mockWaitTimeData.avgOrderToServe.toString(),
      mockWaitTimeData.currentQueueLength.toString(),
      mockWaitTimeData.peakWaitTimeToday.toString(),
    ]);
    rows.push([]);

    // Category breakdown
    rows.push(['=== PRIHODKI PO KATEGORIJI ===']);
    rows.push(['Dan', 'Predjedi', 'Glavne jedi', 'Sladice', 'Pijača']);
    mockCategoryBreakdown.forEach((d) =>
      rows.push([d.day, d.Predjedi.toString(), d.Glavne.toString(), d.Sladice.toString(), d.Pijača.toString()])
    );

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `URY-porocilo-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [metrics, salesTrend, topSellingItems, paymentSplit]);

  // ── Heatmap ────────────────────────────────────────────
  const heatmapDays = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];
  const heatmapHours = Array.from({ length: 14 }, (_, i) => i + 10); // 10–23
  const heatmapMax = Math.max(...hourlyHeatmap.map((p) => p.value), 1);

  // ── Last refreshed formatted ───────────────────────────
  const formattedLastRefreshed = useMemo(() => {
    if (!lastRefreshed) return null;
    return lastRefreshed.toLocaleTimeString('sl-SI', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [lastRefreshed]);

  // ── Dark mode chart colors ─────────────────────────────
  const gridStroke = isDark ? '#374151' : '#f0f0f0';
  const axisStroke = isDark ? '#9ca3af' : '#9ca3af';
  const tooltipStyle = getTooltipStyle(isDark);

  const categoryColors = {
    Predjedi: isDark ? '#34d399' : '#059669',
    Glavne: isDark ? '#fbbf24' : '#d97706',
    Sladice: isDark ? '#f472b6' : '#db2777',
    Pijača: isDark ? '#60a5fa' : '#2563eb',
  };

  const kpiCards = [
    {
      title: 'Skupni prihodki',
      value: `${currency}${metrics.totalRevenue.toLocaleString('sl-SI')}`,
      growth: metrics.revenueGrowth,
      icon: Euro,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Skupna naročila',
      value: metrics.totalOrders.toLocaleString('sl-SI'),
      growth: metrics.ordersGrowth,
      icon: ShoppingCart,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: 'Povprečni račun',
      value: `${currency}${metrics.avgOrderValue.toLocaleString('sl-SI')}`,
      growth: metrics.avgOrderGrowth,
      icon: Receipt,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-amber-900/20',
    },
    {
      title: 'Zasedenost miz',
      value: `${metrics.occupancyRate}%`,
      growth: metrics.occupancyGrowth,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header: Period Selector + Live Status + Refresh Timer ─── */}
      <div className="flex flex-col gap-4">
        {/* Top row: Period selector */}
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground mr-1">Obdobje:</span>
          {(Object.keys(periodLabels) as DashboardPeriod[]).map((period) => (
            <Button
              key={period}
              variant={dashboardPeriod === period ? 'default' : 'outline'}
              size="sm"
              className={dashboardPeriod === period ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setDashboardPeriod(period)}
            >
              {periodLabels[period]}
            </Button>
          ))}

          {/* Live/DEMO badge with pulsing dot */}
          <Badge
            variant="outline"
            className={`text-xs ml-2 flex items-center gap-1.5 ${
              isConnected
                ? 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                : 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            {isConnected ? 'LIVE' : 'DEMO'}
          </Badge>

          {/* Export button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5"
                onClick={handleExportCSV}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Izvozi CSV</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Izvozi podatke namizja v CSV</TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom row: Refresh timer + Last updated */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {isConnected && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-emerald-500" />
              <span className="text-xs">
                Osvežitev čez <span className="font-bold tabular-nums text-foreground">{countdown}s</span>
              </span>
              <CircularTimer seconds={countdown} total={REFRESH_INTERVAL} />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    await refreshData();
                  } finally {
                    setIsRefreshing(false);
                    setCountdown(REFRESH_INTERVAL);
                  }
                }}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
          {formattedLastRefreshed && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">
                Zadnja posodobitev: <span className="font-medium text-foreground">{formattedLastRefreshed}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.growth >= 0;
          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bg}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  {isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{kpi.growth.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">vs prejšnje obdobje</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Occupancy Progress ────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium">Zasedenost miz</span>
            </div>
            <span className="text-sm font-bold text-violet-600">{metrics.occupancyRate}%</span>
          </div>
          <Progress value={metrics.occupancyRate} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Rast: {metrics.occupancyGrowth >= 0 ? '+' : ''}{metrics.occupancyGrowth.toFixed(1)}% vs prejšnje obdobje</span>
            <span className="text-violet-600 font-medium">{metrics.occupancyRate}% zasedenosti</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Sales Trend Chart ────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Trend prodaje</CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-500 rounded-sm inline-block" /> Prihodki</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-amber-500 rounded-sm inline-block" /> Naročila</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="advRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#34d399' : '#059669'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isDark ? '#34d399' : '#059669'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: axisStroke }} stroke={axisStroke} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: axisStroke }}
                  stroke={axisStroke}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#f59e0b' }}
                  stroke="#f59e0b"
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => {
                    if (name === 'Prihodki') return [`${currency}${value.toLocaleString('sl-SI')}`, name];
                    return [value.toString(), name];
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Prihodki"
                  stroke={isDark ? '#34d399' : '#059669'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#advRevenueGrad)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Naročila"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Two column: Top Items + Payment Split ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Najbolj prodajani
              </CardTitle>
              <Badge variant="secondary" className="text-xs">Top {topSellingItems.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellingItems.slice(0, 8).map((item, idx) => {
                const maxRevenue = topSellingItems[0]?.revenue || 1;
                const barWidth = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}.</span>
                        <span className={`w-2.5 h-2.5 rounded-sm border ${item.isVeg ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`} />
                        <span className="font-medium truncate max-w-[140px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{item.quantity}x</span>
                        <span className="font-mono font-medium text-emerald-600">{currency}{item.revenue.toLocaleString('sl-SI')}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Split */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Načini plačila
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="method"
                    label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => [`${currency}${value.toLocaleString('sl-SI')}`, '']}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {paymentSplit.map((p) => (
                <div key={p.method} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
                    <span>{p.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{p.count} transakcij</span>
                    <span className="font-mono font-medium">{currency}{p.amount.toLocaleString('sl-SI')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Two column: Staff Performance + Wait Time Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Performance Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-orange-500" />
                Uspešnost osebja
              </CardTitle>
              <Badge variant="secondary" className="text-xs">Danes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                <UserCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Top natakar</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{mockStaffMetrics.topWaiter}</p>
                <p className="text-[10px] text-muted-foreground">{mockStaffMetrics.topWaiterOrders} naročil</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-center">
                <Timer className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Povp. čas priprave</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{mockStaffMetrics.avgPrepTime} min</p>
                <p className="text-[10px] text-muted-foreground">povprečje</p>
              </div>
              <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 p-3 text-center">
                <Gauge className="h-4 w-4 text-violet-600 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Skladišč. prepustnost</p>
                <p className="text-sm font-bold text-violet-700 dark:text-violet-400">{mockStaffMetrics.kitchenThroughput}</p>
                <p className="text-[10px] text-muted-foreground">naročil/h</p>
              </div>
            </div>

            {/* Bar chart for individual staff */}
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockStaffData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: axisStroke }}
                    stroke={axisStroke}
                  />
                  <YAxis tick={{ fontSize: 11, fill: axisStroke }} stroke={axisStroke} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="ordersServed"
                    name="Postrežena naročila"
                    fill={isDark ? '#34d399' : '#059669'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wait Time Analytics Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Časi čakanja
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-xs ${
                  mockWaitTimeData.avgOrderToServe <= mockWaitTimeData.targetWaitTime
                    ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400'
                    : 'border-red-300 text-red-700 dark:text-red-400'
                }`}
              >
                {mockWaitTimeData.avgOrderToServe <= mockWaitTimeData.targetWaitTime ? 'V normi' : 'Prekoračeno'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Gauge visualizations */}
            <div className="space-y-4 mb-5">
              <WaitTimeGauge
                value={mockWaitTimeData.avgOrderToServe}
                max={40}
                label="Povprečni čas naročila do postrežbe"
                color={isDark ? '#34d399' : '#059669'}
              />
              <WaitTimeGauge
                value={mockWaitTimeData.peakWaitTimeToday}
                max={40}
                label="Vršni čas čakanja danes"
                color={isDark ? '#fbbf24' : '#d97706'}
              />
            </div>

            {/* Queue length indicator */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-500" />
                <span className="text-sm">Trenutna čakalna vrsta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-violet-600">{mockWaitTimeData.currentQueueLength}</span>
                <span className="text-xs text-muted-foreground">naročil</span>
              </div>
            </div>

            {/* Wait time trend mini chart */}
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWaitTimeHistory} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waitTimeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isDark ? '#60a5fa' : '#3b82f6'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: axisStroke }} stroke={axisStroke} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: axisStroke }} stroke={axisStroke} />
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${value} min`, 'Čas čakanja']}
                  />
                  <Area
                    type="monotone"
                    dataKey="waitTime"
                    stroke={isDark ? '#60a5fa' : '#3b82f6'}
                    strokeWidth={2}
                    fill="url(#waitTimeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Category Breakdown Stacked Bar Chart ──────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Prihodki po kategorijah (tedensko)
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: categoryColors.Predjedi }} /> Predjedi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: categoryColors.Glavne }} /> Glavne
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: categoryColors.Sladice }} /> Sladice
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: categoryColors.Pijača }} /> Pijača
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: axisStroke }} stroke={axisStroke} />
                <YAxis
                  tick={{ fontSize: 12, fill: axisStroke }}
                  stroke={axisStroke}
                  tickFormatter={(v) => `${currency}${(v / 1000).toFixed(1)}k`}
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [`${currency}${value.toLocaleString('sl-SI')}`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: isDark ? '#d1d5db' : '#374151' }}
                />
                <Bar dataKey="Predjedi" stackId="a" fill={categoryColors.Predjedi} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Glavne" stackId="a" fill={categoryColors.Glavne} />
                <Bar dataKey="Sladice" stackId="a" fill={categoryColors.Sladice} />
                <Bar dataKey="Pijača" stackId="a" fill={categoryColors.Pijača} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Hourly Heatmap ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Urna aktivnost (tedenski povprečki)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex items-center gap-1 mb-1">
                <div className="w-10 shrink-0" />
                {heatmapHours.map((h) => (
                  <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
                    {String(h).padStart(2, '0')}
                  </div>
                ))}
              </div>
              {/* Heatmap rows */}
              {heatmapDays.map((day) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <div className="w-10 shrink-0 text-xs font-medium text-right pr-1">{day}</div>
                  {heatmapHours.map((hour) => {
                    const point = hourlyHeatmap.find((p) => p.day === day && p.hour === hour);
                    const value = point?.value || 0;
                    const intensity = Math.min(value / heatmapMax, 1);
                    const bg = intensity === 0
                      ? (isDark ? 'rgba(55,65,81,0.3)' : 'rgba(243,244,246,1)')
                      : `rgba(5, 150, 105, ${Math.max(0.1, intensity * 0.9)})`;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="flex-1 aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: bg }}
                        title={`${day} ${String(hour).padStart(2, '0')}:00 — ${currency}${value.toLocaleString('sl-SI')}`}
                      />
                    );
                  })}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                <span>Nizka</span>
                <div className="flex gap-0.5">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                    <div
                      key={opacity}
                      className="w-4 h-3 rounded-sm"
                      style={{ backgroundColor: `rgba(5, 150, 105, ${opacity})` }}
                    />
                  ))}
                </div>
                <span>Visoka</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
