'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { TrendingUp, TrendingDown, DollarSign, PieChartIcon, Download, FileText } from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';

export function PLTab() {
  const { plSummary, dailyPL, expenseBreakdown, plLineItems, currency, restaurantName, isConnected } = useURYStore();

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

  const handleExportCSV = () => {
    const headers = ['Postavka', 'Znesek'];
    const rows = plLineItems.map((item) => [
      item.label,
      item.value < 0 ? `-${currency}${Math.abs(item.value)}` : `${currency}${item.value}`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PL-porocilo-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('P&L Poročilo', 14, 22);

    // Restaurant name and date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(restaurantName, 14, 30);
    doc.setFontSize(10);
    doc.text(`Datum: ${new Date().toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 36);
    doc.text(`Vir: ${isConnected ? 'Frappe strežnik (LIVE)' : 'Simulirani podatki (DEMO)'}`, 14, 42);

    // Summary cards section
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Povzetek', 14, 52);

    autoTable(doc, {
      startY: 55,
      head: [['Postavka', 'Znesek']],
      body: [
        ['Bruto prodaja', `${currency}${plSummary.grossSales.toLocaleString('en-IN')}`],
        ['COGS', `-${currency}${plSummary.cogs.toLocaleString('en-IN')}`],
        ['Bruto dobiček', `${currency}${plSummary.grossProfit.toLocaleString('en-IN')}`],
        ['Neto dobiček', `${currency}${plSummary.netProfit.toLocaleString('en-IN')}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 60 },
      },
      didParseCell: (data) => {
        // Highlight negative values in red
        if (data.section === 'body' && data.column.index === 1) {
          const text = data.cell.raw as string;
          if (text.startsWith('-')) {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
          }
        }
        // Highlight net profit in green
        if (data.section === 'body' && data.row.index === 3) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [5, 150, 105]; // emerald-600
        }
      },
    });

    // Margin indicators
    const summaryEndY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 100;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Bruto marža: ${grossMargin}%    |    Neto marža: ${profitMargin}%`, 14, summaryEndY + 10);

    // Daily P&L section
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Dnevni P&L (7 dni)', 14, summaryEndY + 22);

    autoTable(doc, {
      startY: summaryEndY + 25,
      head: [['Dan', 'Prihodki', 'Stroški', 'Dobiček']],
      body: dailyPL.map((d) => [
        d.day,
        `${currency}${d.revenue.toLocaleString('en-IN')}`,
        `${currency}${d.costs.toLocaleString('en-IN')}`,
        `${currency}${(d.revenue - d.costs).toLocaleString('en-IN')}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const text = data.cell.raw as string;
          if (text.startsWith('-')) {
            data.cell.styles.textColor = [220, 38, 38];
          } else {
            data.cell.styles.textColor = [5, 150, 105];
          }
        }
      },
    });

    // Expense Breakdown section (new page)
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Razdelitev stroškov', 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Kategorija', 'Delež']],
      body: expenseBreakdown.map((e) => [e.name, `${e.value}%`]),
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 40 },
      },
    });

    // Full P&L Line Items
    const expenseEndY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 80;
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Podrobnosti P&L', 14, expenseEndY + 15);

    autoTable(doc, {
      startY: expenseEndY + 18,
      head: [['Postavka', 'Znesek']],
      body: plLineItems.map((item) => [
        item.label,
        `${item.value < 0 ? '-' : ''}${currency}${Math.abs(item.value).toLocaleString('en-IN')}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { fontStyle: item.bold ? 'bold' : 'normal', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 60, fontStyle: item.bold ? 'bold' : 'normal' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const text = data.cell.raw as string;
          if (text.startsWith('-')) {
            data.cell.styles.textColor = [220, 38, 38]; // red for negative
          }
          if ((data.row.index === 2 || data.row.index === 6)) {
            // Gross profit and Net profit lines
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `URY Dashboard — P&L Poročilo — Stran ${i} od ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`PL-porocilo-${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
                    {card.value < 0 ? '-' : ''}{currency}{Math.abs(card.value).toLocaleString('en-IN')}
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
                <BarChart data={dailyPL} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${currency}${value.toLocaleString('en-IN')}`,
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Podrobnosti P&L</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1.5" />
                CSV
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-1.5" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Postavka</TableHead>
                <TableHead className="text-right">Znesek ({currency})</TableHead>
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
                    {item.value < 0 ? '-' : ''}{currency}{Math.abs(item.value).toLocaleString('en-IN')}
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
