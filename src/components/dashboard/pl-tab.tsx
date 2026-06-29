'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChartIcon } from 'lucide-react';
import { plSummary, dailyPLData, expenseBreakdown, plLineItems, CURRENCY } from '@/lib/mock-data';

export function PLTab() {
  const summaryCards = [
    {
      title: 'Bruto prodaja',
      value: plSummary.grossSales,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'COGS',
      value: plSummary.cogs,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Bruto dobiček',
      value: plSummary.grossProfit,
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Neto dobiček',
      value: plSummary.netProfit,
      icon: PieChartIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const profitMargin = ((plSummary.netProfit / plSummary.grossSales) * 100).toFixed(1);
  const grossMargin = ((plSummary.grossProfit / plSummary.grossSales) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">
                    {card.value < 0 ? '-' : ''}{CURRENCY}{Math.abs(card.value).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Margin indicators */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bruto marža</span>
            <span className="text-lg font-bold text-amber-600">{grossMargin}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Neto marža</span>
            <span className="text-lg font-bold text-emerald-600">{profitMargin}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Dnevni P&L (7 dni)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPLData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${CURRENCY}${value.toLocaleString('en-IN')}`,
                      name === 'revenue' ? 'Prihodki' : 'Stroški',
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  />
                  <Legend
                    formatter={(value) => (value === 'revenue' ? 'Prihodki' : 'Stroški')}
                  />
                  <Bar dataKey="revenue" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="costs" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Razdelitev stroškov</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Line Items Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Podrobnosti P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Postavka</TableHead>
                <TableHead className="text-right">Znesek ({CURRENCY})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plLineItems.map((item) => (
                <TableRow key={item.label}>
                  <TableCell className={item.bold ? 'font-bold' : ''}>
                    {item.label}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${item.bold ? 'font-bold' : ''} ${
                      item.value < 0 ? 'text-red-600' : item.value > 0 && item.label.includes('Neto') ? 'text-emerald-600' : ''
                    }`}
                  >
                    {item.value < 0 ? '-' : ''}{CURRENCY}{Math.abs(item.value).toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
