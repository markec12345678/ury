'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
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
  AreaChart,
  Area,
  Line,
  ComposedChart,
} from 'recharts';
import {
  FileText,
  Download,
  CalendarDays,
  Euro,
  ShoppingCart,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Zap,
  Clock,
  Printer,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  GitCompareArrows,
  CalendarRange,
  Loader2,
} from 'lucide-react';
import { useURYStore } from '@/lib/ury-store';
import type { ReportPeriod, ReportSummary, SalesTrendPoint } from '@/lib/ury-types';

// ── Period labels (Slovenian) ────────────────────────────
const periodLabels: Record<ReportPeriod, string> & { custom: string } = {
  daily: 'Dnevno',
  weekly: 'Tedensko',
  monthly: 'Mesečno',
  custom: 'Po meri',
};

const periodDescriptions: Record<ReportPeriod, string> & { custom: string } = {
  daily: 'Pregled poslovanja za izbrani dan',
  weekly: 'Pregled poslovanja za izbrani teden',
  monthly: 'Pregled poslovanja za izbrani mesec',
  custom: 'Pregled poslovanja za izbrano obdobje',
};

const comparisonLabels: Record<ReportPeriod, string> & { custom: string } = {
  daily: 'Danes vs Včeraj',
  weekly: 'Ta teden vs Prejšnji teden',
  monthly: 'Ta mesec vs Prejšnji mesec',
  custom: 'Izbrano obdobje vs Prejšnje obdobje',
};

// ── Previous period mock data generator ──────────────────
// Multiplies current data by realistic factors to simulate previous period
function generatePreviousPeriodData(current: ReportSummary): ReportSummary {
  const revenueFactor = 0.85 + Math.random() * 0.2; // 0.85 – 1.05
  const orderFactor = 0.88 + Math.random() * 0.15;
  const discountFactor = 0.9 + Math.random() * 0.2;
  const cancelFactor = 0.8 + Math.random() * 0.4;

  return {
    ...current,
    totalRevenue: Math.round(current.totalRevenue * revenueFactor),
    totalOrders: Math.round(current.totalOrders * orderFactor),
    avgOrderValue: Math.round((current.totalRevenue * revenueFactor) / (current.totalOrders * orderFactor)),
    totalDiscounts: Math.round(current.totalDiscounts * discountFactor),
    totalCancellations: Math.round(current.totalCancellations * cancelFactor),
    netRevenue: Math.round(
      current.totalRevenue * revenueFactor - current.totalDiscounts * discountFactor
    ),
    topItems: current.topItems.map((item) => ({
      ...item,
      quantity: Math.round(item.quantity * (0.8 + Math.random() * 0.3)),
      revenue: Math.round(item.revenue * (0.8 + Math.random() * 0.3)),
    })),
    dailyBreakdown: current.dailyBreakdown.map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * (0.82 + Math.random() * 0.25)),
      orders: Math.round(d.orders * (0.85 + Math.random() * 0.2)),
    })),
    paymentSplit: current.paymentSplit.map((p) => ({
      ...p,
      count: Math.round(p.count * (0.85 + Math.random() * 0.2)),
      amount: Math.round(p.amount * (0.85 + Math.random() * 0.2)),
    })),
    orderTypeSplit: current.orderTypeSplit.map((o) => ({
      ...o,
      count: Math.round(o.count * (0.85 + Math.random() * 0.2)),
      revenue: Math.round(o.revenue * (0.85 + Math.random() * 0.2)),
    })),
    courseRevenue: current.courseRevenue.map((c) => ({
      ...c,
      revenue: Math.round(c.revenue * (0.82 + Math.random() * 0.25)),
      items: Math.round(c.items * (0.85 + Math.random() * 0.2)),
    })),
  };
}

// ── Generate AI-style insight text ───────────────────────
function generateInsight(
  current: ReportSummary,
  previous: ReportSummary | null,
  currency: string
): string {
  const parts: string[] = [];

  // Revenue insight
  if (previous) {
    const revDelta = ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100;
    if (revDelta > 0) {
      parts.push(`Prihodki so se povečali za ${revDelta.toFixed(1)}% v primerjavi s prejšnjim obdobjem`);
    } else if (revDelta < 0) {
      parts.push(`Prihodki so se zmanjšali za ${Math.abs(revDelta).toFixed(1)}% v primerjavi s prejšnjim obdobjem`);
    } else {
      parts.push('Prihodki so ostali enaki kot v prejšnjem obdobju');
    }

    // Orders insight
    const ordDelta = ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100;
    if (Math.abs(ordDelta) > 3) {
      parts.push(`število naročil se je ${ordDelta > 0 ? 'povečalo' : 'zmanjšalo'} za ${Math.abs(ordDelta).toFixed(1)}%`);
    }
  } else {
    parts.push(`Skupni prihodki znašajo ${currency}${current.totalRevenue.toLocaleString('sl-SI')} s ${current.totalOrders} naročili`);
  }

  // Top item insight
  if (current.topItems.length > 0) {
    const top = current.topItems[0];
    parts.push(`${top.name} ostaja najbolj prodajan artikel (${top.quantity}x, ${currency}${top.revenue.toLocaleString('sl-SI')})`);
  }

  // Net margin insight
  const netMargin = current.totalRevenue > 0 ? (current.netRevenue / current.totalRevenue) * 100 : 0;
  if (netMargin > 90) {
    parts.push(`Neto marža je odlična (${netMargin.toFixed(1)}%)`);
  } else if (netMargin > 80) {
    parts.push(`Neto marža je dobra (${netMargin.toFixed(1)}%)`);
  } else {
    parts.push(`Neto marža znaša ${netMargin.toFixed(1)}% — priporočljivo je zmanjšati popuste in preklice`);
  }

  // Cancellations insight
  if (current.totalCancellations > 5) {
    parts.push(`Pozor: ${current.totalCancellations} preklicanih naročil — preverite vzroke`);
  }

  return parts.join('. ') + '.';
}

// ── Delta arrow component ────────────────────────────────
function DeltaArrow({ current, previous, invert = false, suffix = '%' }: {
  current: number;
  previous: number;
  invert?: boolean;
  suffix?: string;
}) {
  if (previous === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const delta = ((current - previous) / previous) * 100;
  const isPositive = invert ? delta < 0 : delta > 0;
  const isNeutral = Math.abs(delta) < 0.5;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        {delta.toFixed(1)}{suffix}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(delta).toFixed(1)}{suffix}
    </span>
  );
}

// ── Main component ───────────────────────────────────────
export function ReportGeneratorTab() {
  const {
    reportPeriod,
    reportData,
    currency,
    setReportPeriod,
    exportReportPDF,
    isConnected,
    addToast,
    restaurantName,
  } = useURYStore();

  const report = reportData;

  // Local state for custom features
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Chart refs for PDF capture
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const orderTypeChartRef = useRef<HTMLDivElement>(null);
  const courseChartRef = useRef<HTMLDivElement>(null);

  // Generate previous period data (stable across renders when comparison enabled)
  const previousData = useMemo(() => {
    if (!comparisonEnabled) return null;
    return generatePreviousPeriodData(report);
  }, [comparisonEnabled, report.totalRevenue, report.totalOrders, reportPeriod]);

  // AI insight
  const insight = useMemo(
    () => generateInsight(report, previousData, currency),
    [report.totalRevenue, report.totalOrders, report.netRevenue, report.totalCancellations, comparisonEnabled, currency]
  );

  // Composed chart data for comparison mode
  const comparisonChartData = useMemo(() => {
    if (!comparisonEnabled || !previousData) return [];
    return report.dailyBreakdown.map((d, i) => ({
      label: d.label,
      revenue: d.revenue,
      prevRevenue: previousData.dailyBreakdown[i]?.revenue || 0,
      orders: d.orders,
      prevOrders: previousData.dailyBreakdown[i]?.orders || 0,
    }));
  }, [comparisonEnabled, previousData, report.dailyBreakdown]);

  // Handle period change
  const handlePeriodChange = useCallback((period: ReportPeriod | 'custom') => {
    if (period === 'custom') {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      setReportPeriod(period);
    }
  }, [setReportPeriod]);

  // Enhanced PDF export
  const handleEnhancedPDFExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;

      const periodTitleMap: Record<string, string> = {
        daily: 'Dnevno poročilo',
        weekly: 'Tedensko poročilo',
        monthly: 'Mesečno poročilo',
      };
      const periodTitle = isCustomMode
        ? `Poročilo po meri (${customDateFrom || report.dateFrom} – ${customDateTo || report.dateTo})`
        : (periodTitleMap[report.period] || 'Poročilo');

      // ── Page 1: Header banner ──────────────────────────
      // Colored banner
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Restaurant name in banner
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(restaurantName, margin, 18);

      // Report title
      doc.setFontSize(14);
      doc.text(periodTitle, margin, 30);

      // Generated timestamp
      doc.setFontSize(9);
      doc.setTextColor(200, 240, 220);
      const timestamp = new Date().toLocaleString('sl-SI', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(`Generirano: ${timestamp}`, margin, 39);

      // Live/Demo badge
      doc.setFontSize(8);
      doc.setTextColor(200, 240, 220);
      doc.text(isConnected ? 'LIVE' : 'DEMO', pageWidth - margin - 15, 18);

      // ── Watermark ───────────────────────────────────────
      const addWatermark = () => {
        const currentPage = doc.getCurrentPageInfo().pageNumber;
        doc.setPage(currentPage);
        doc.setFontSize(60);
        doc.setTextColor(230, 230, 230);
        doc.saveGraphicsState();
        // We'll add watermark text diagonally using a transform approximation
        // jsPDF doesn't natively support rotation easily, so we use text with opacity feel
        doc.text('URY Dashboard', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45,
        });
        doc.restoreGraphicsState();
      };

      // ── Summary Table ───────────────────────────────────
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(16);
      doc.text('Povzetek', margin, 58);

      const summaryRows: string[][] = [
        ['Skupni prihodki', `${currency}${report.totalRevenue.toLocaleString('sl-SI')}`],
        ['Skupna naročila', report.totalOrders.toString()],
        ['Povprečni račun', `${currency}${report.avgOrderValue.toLocaleString('sl-SI')}`],
        ['Popusti', `-${currency}${report.totalDiscounts.toLocaleString('sl-SI')}`],
        ['Preklici', report.totalCancellations.toString()],
        ['Neto prihodki', `${currency}${report.netRevenue.toLocaleString('sl-SI')}`],
      ];

      // If comparison, add previous period columns
      if (comparisonEnabled && previousData) {
        autoTable(doc, {
          startY: 62,
          head: [['Postavka', 'Trenutno', 'Prejšnje', 'Sprememba']],
          body: [
            [
              'Skupni prihodki',
              `${currency}${report.totalRevenue.toLocaleString('sl-SI')}`,
              `${currency}${previousData.totalRevenue.toLocaleString('sl-SI')}`,
              `${((report.totalRevenue - previousData.totalRevenue) / previousData.totalRevenue * 100).toFixed(1)}%`,
            ],
            [
              'Skupna naročila',
              report.totalOrders.toString(),
              previousData.totalOrders.toString(),
              `${((report.totalOrders - previousData.totalOrders) / previousData.totalOrders * 100).toFixed(1)}%`,
            ],
            [
              'Povprečni račun',
              `${currency}${report.avgOrderValue.toLocaleString('sl-SI')}`,
              `${currency}${previousData.avgOrderValue.toLocaleString('sl-SI')}`,
              `${((report.avgOrderValue - previousData.avgOrderValue) / previousData.avgOrderValue * 100).toFixed(1)}%`,
            ],
            [
              'Popusti',
              `-${currency}${report.totalDiscounts.toLocaleString('sl-SI')}`,
              `-${currency}${previousData.totalDiscounts.toLocaleString('sl-SI')}`,
              `${((report.totalDiscounts - previousData.totalDiscounts) / previousData.totalDiscounts * 100).toFixed(1)}%`,
            ],
            [
              'Preklici',
              report.totalCancellations.toString(),
              previousData.totalCancellations.toString(),
              `${((report.totalCancellations - previousData.totalCancellations) / previousData.totalCancellations * 100).toFixed(1)}%`,
            ],
            [
              'Neto prihodki',
              `${currency}${report.netRevenue.toLocaleString('sl-SI')}`,
              `${currency}${previousData.netRevenue.toLocaleString('sl-SI')}`,
              `${((report.netRevenue - previousData.netRevenue) / previousData.netRevenue * 100).toFixed(1)}%`,
            ],
          ],
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 10 },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [240, 253, 244] },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 55 },
            1: { halign: 'right', cellWidth: 40 },
            2: { halign: 'right', cellWidth: 40 },
            3: { halign: 'right', cellWidth: 30 },
          },
          didParseCell: (data: Record<string, unknown>) => {
            const section = data.section as string;
            const column = data.column as { index: number };
            const cell = data.cell as { raw: string; styles: { textColor: number[]; fontStyle?: string } };
            if (section === 'body' && column.index === 3) {
              const text = cell.raw;
              if (typeof text === 'string') {
                const val = parseFloat(text);
                if (val < 0) cell.styles.textColor = [220, 38, 38];
                else cell.styles.textColor = [5, 150, 105];
              }
            }
            if (section === 'body' && column.index === 1 && (data.row as { index: number }).index === 5) {
              cell.styles.fontStyle = 'bold';
              cell.styles.textColor = [5, 150, 105];
            }
          },
        });
      } else {
        autoTable(doc, {
          startY: 62,
          head: [['Postavka', 'Vrednost']],
          body: summaryRows,
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 10 },
          bodyStyles: { fontSize: 10 },
          alternateRowStyles: { fillColor: [240, 253, 244] },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 80 },
            1: { halign: 'right', cellWidth: 60 },
          },
          didParseCell: (data: Record<string, unknown>) => {
            const section = data.section as string;
            const column = data.column as { index: number };
            const cell = data.cell as { raw: string; styles: { textColor: number[]; fontStyle?: string } };
            if (section === 'body' && column.index === 1) {
              const text = cell.raw;
              if (typeof text === 'string' && text.startsWith('-')) {
                cell.styles.textColor = [220, 38, 38];
              }
              if ((data.row as { index: number }).index === 5) {
                cell.styles.fontStyle = 'bold';
                cell.styles.textColor = [5, 150, 105];
              }
            }
          },
        });
      }

      // ── Capture chart as image ─────────────────────────
      const captureChart = async (ref: React.RefObject<HTMLDivElement | null>): Promise<string | null> => {
        if (!ref.current) return null;
        const canvasEl = ref.current.querySelector('canvas');
        if (!canvasEl) return null;
        return canvasEl.toDataURL('image/png');
      };

      // ── Top Selling Items ───────────────────────────────
      const summaryEndY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 120;
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('Najbolj prodajani artikli', margin, summaryEndY + 15);

      autoTable(doc, {
        startY: summaryEndY + 18,
        head: [['Artikel', 'Količina', 'Prihodki', 'Kategorija']],
        body: report.topItems.map((item) => [
          item.name,
          item.quantity.toString(),
          `${currency}${item.revenue.toLocaleString('sl-SI')}`,
          item.course,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: margin, right: margin },
      });

      // ── Page 2: Charts ─────────────────────────────────
      doc.addPage();

      // Add watermark to page 1
      doc.setPage(1);
      addWatermark();

      doc.setPage(2);

      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('Trend prihodkov', margin, 22);

      // Try to capture chart image
      const revenueImg = await captureChart(revenueChartRef);
      if (revenueImg) {
        doc.addImage(revenueImg, 'PNG', margin, 26, pageWidth - margin * 2, 80);
      } else {
        // Fallback: daily breakdown table
        autoTable(doc, {
          startY: 26,
          head: [['Datum/Ura', 'Prihodki', 'Naročila']],
          body: report.dailyBreakdown.map((d) => [
            d.label,
            `${currency}${d.revenue.toLocaleString('sl-SI')}`,
            d.orders.toString(),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105], textColor: 255 },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [240, 253, 244] },
          margin: { left: margin, right: margin },
        });
      }

      // Order type chart
      const chartY = revenueImg ? 112 : (doc as unknown as Record<string, number>).lastAutoTable?.finalY + 15 || 120;
      if (!revenueImg) {
        doc.setFontSize(16);
        doc.setTextColor(30, 30, 30);
      }
      doc.text('Razdelitev po tipu naročila', margin, chartY);

      const otImg = await captureChart(orderTypeChartRef);
      if (otImg) {
        doc.addImage(otImg, 'PNG', margin, chartY + 4, (pageWidth - margin * 2) / 2, 70);
      }

      // Course revenue chart
      const courseImg = await captureChart(courseChartRef);
      if (courseImg) {
        doc.addImage(courseImg, 'PNG', pageWidth / 2, chartY + 4, (pageWidth - margin * 2) / 2, 70);
      }

      // ── Page 3: Payment + Course tables ─────────────────
      doc.addPage();
      addWatermark();

      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('Razdelitev plačil', margin, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Metoda', 'Število', 'Znesek']],
        body: report.paymentSplit.map((p) => [
          p.method,
          p.count.toString(),
          `${currency}${p.amount.toLocaleString('sl-SI')}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: margin, right: margin },
      });

      const payEndY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 80;
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('Razdelitev po tipu naročila', margin, payEndY + 15);

      autoTable(doc, {
        startY: payEndY + 18,
        head: [['Tip', 'Število', 'Prihodki']],
        body: report.orderTypeSplit.map((o) => [
          o.type,
          o.count.toString(),
          `${currency}${o.revenue.toLocaleString('sl-SI')}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: margin, right: margin },
      });

      const otEndY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 140;
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('Prihodki po kategorijah', margin, otEndY + 15);

      autoTable(doc, {
        startY: otEndY + 18,
        head: [['Kategorija', 'Prihodki', 'Artikli']],
        body: report.courseRevenue.map((c) => [
          c.course,
          `${currency}${c.revenue.toLocaleString('sl-SI')}`,
          c.items.toString(),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { left: margin, right: margin },
      });

      // ── Page 4: Daily breakdown ─────────────────────────
      if (report.dailyBreakdown.length > 0) {
        doc.addPage();
        addWatermark();

        doc.setFontSize(16);
        doc.setTextColor(30, 30, 30);
        doc.text('Dnevni pregled', margin, 22);

        autoTable(doc, {
          startY: 28,
          head: [['Datum/Ura', 'Prihodki', 'Naročila']],
          body: report.dailyBreakdown.map((d) => [
            d.label,
            `${currency}${d.revenue.toLocaleString('sl-SI')}`,
            d.orders.toString(),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105], textColor: 255 },
          bodyStyles: { fontSize: 10 },
          alternateRowStyles: { fillColor: [240, 253, 244] },
          margin: { left: margin, right: margin },
        });
      }

      // ── Footers on all pages ────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addWatermark();
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `URY Dashboard — ${periodTitle} — Stran ${i} od ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Generirano: ${timestamp}`,
          margin,
          pageHeight - 10
        );
      }

      doc.save(`${isCustomMode ? 'custom' : report.period}-porocilo-${report.dateFrom}.pdf`);
      addToast({ type: 'success', title: 'PDF generiran', description: 'Poročilo je bilo shranjeno z izboljšanim izgledom' });
    } catch (err) {
      console.error('PDF export error:', err);
      addToast({ type: 'error', title: 'Napaka pri izvozu', description: 'PDF ni bilo mogoče generirati' });
    } finally {
      setIsExporting(false);
    }
  }, [report, previousData, comparisonEnabled, isCustomMode, customDateFrom, customDateTo, currency, isConnected, addToast, restaurantName]);

  // CSV export
  const handleExportCSV = useCallback(() => {
    const headers = comparisonEnabled && previousData
      ? ['Postavka', 'Trenutno', 'Prejšnje', 'Sprememba %']
      : ['Postavka', 'Vrednost'];

    const pct = (curr: number, prev: number) => prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) : '0';

    const rows = comparisonEnabled && previousData
      ? [
          ['Skupni prihodki', `${report.totalRevenue}`, `${previousData.totalRevenue}`, pct(report.totalRevenue, previousData.totalRevenue)],
          ['Skupna naročila', `${report.totalOrders}`, `${previousData.totalOrders}`, pct(report.totalOrders, previousData.totalOrders)],
          ['Povprečni račun', `${report.avgOrderValue}`, `${previousData.avgOrderValue}`, pct(report.avgOrderValue, previousData.avgOrderValue)],
          ['Popusti', `${report.totalDiscounts}`, `${previousData.totalDiscounts}`, pct(report.totalDiscounts, previousData.totalDiscounts)],
          ['Preklici', `${report.totalCancellations}`, `${previousData.totalCancellations}`, pct(report.totalCancellations, previousData.totalCancellations)],
          ['Neto prihodki', `${report.netRevenue}`, `${previousData.netRevenue}`, pct(report.netRevenue, previousData.netRevenue)],
        ]
      : [
          ['Skupni prihodki', `${report.totalRevenue}`],
          ['Skupna naročila', `${report.totalOrders}`],
          ['Povprečni račun', `${report.avgOrderValue}`],
          ['Popusti', `${report.totalDiscounts}`],
          ['Preklici', `${report.totalCancellations}`],
          ['Neto prihodki', `${report.netRevenue}`],
        ];

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.period}-porocilo-${report.dateFrom}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [report, previousData, comparisonEnabled]);

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') return `${currency}${value.toLocaleString('sl-SI')}`;
    return value.toLocaleString('sl-SI');
  };

  const courseColors = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  const activePeriodKey = isCustomMode ? 'custom' : reportPeriod;

  // Summary cards
  const summaryCards = [
    {
      title: 'Skupni prihodki',
      value: report.totalRevenue,
      prevValue: previousData?.totalRevenue,
      icon: Euro,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      format: 'currency',
    },
    {
      title: 'Skupna naročila',
      value: report.totalOrders,
      prevValue: previousData?.totalOrders,
      icon: ShoppingCart,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      gradient: 'from-amber-500/10 to-amber-600/5',
      format: 'number',
    },
    {
      title: 'Povprečni račun',
      value: report.avgOrderValue,
      prevValue: previousData?.avgOrderValue,
      icon: Receipt,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      gradient: 'from-violet-500/10 to-violet-600/5',
      format: 'currency',
    },
    {
      title: 'Neto prihodki',
      value: report.netRevenue,
      prevValue: previousData?.netRevenue,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      format: 'currency',
    },
  ];

  return (
    <>
      {/* Print-optimized CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-break-before { page-break-before: always; }
          .print-break-after { page-break-after: always; }
          .print-break-inside-avoid { page-break-inside: avoid; }
          [data-print-full-width] { width: 100% !important; max-width: 100% !important; }
          .shadow-sm, .shadow, .shadow-md { box-shadow: none !important; }
          .rounded-xl, .rounded-lg, .rounded-2xl { border-radius: 4px !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}} />

      <div className="space-y-6">
        {/* ── Period Selector + Actions ─────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground mr-1">Obdobje:</span>
            {(['daily', 'weekly', 'monthly', 'custom'] as const).map((period) => (
              <Button
                key={period}
                variant={(period === 'custom' ? isCustomMode : reportPeriod === period && !isCustomMode) ? 'default' : 'outline'}
                size="sm"
                className={
                  (period === 'custom' ? isCustomMode : reportPeriod === period && !isCustomMode)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }
                onClick={() => handlePeriodChange(period)}
              >
                {periodLabels[period]}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {isCustomMode ? `${customDateFrom || report.dateFrom} – ${customDateTo || report.dateTo}` : report.periodLabel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1" />
              CSV
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleEnhancedPDFExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5 mr-1" />
              )}
              PDF poročilo
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 mr-1" />
              Natisni
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addToast({ type: 'info', title: 'Kmalu na voljo', description: 'Funkcija bo na voljo v naslednji verziji' })}
            >
              <Mail className="h-3.5 w-3.5 mr-1" />
              Pošlji po e-pošti
            </Button>
          </div>
        </div>

        {/* ── Custom Date Range Picker ──────────────────── */}
        {isCustomMode && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 no-print">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">Izberite obdobje:</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="date-from" className="text-xs text-muted-foreground">Od</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-40 h-9 text-sm"
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">—</span>
                  <div className="space-y-1">
                    <Label htmlFor="date-to" className="text-xs text-muted-foreground">Do</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-40 h-9 text-sm"
                    />
                  </div>
                  {customDateFrom && customDateTo && (
                    <Badge variant="secondary" className="mt-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {Math.max(1, Math.ceil((new Date(customDateTo).getTime() - new Date(customDateFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1)} dni
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Period Info + Comparison Toggle ───────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{periodDescriptions[activePeriodKey]}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Od: {isCustomMode ? (customDateFrom || report.dateFrom) : report.dateFrom}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Do: {isCustomMode ? (customDateTo || report.dateTo) : report.dateTo}</span>
            <Badge variant="outline" className="text-xs ml-2">
              {isConnected ? 'LIVE' : 'DEMO'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="comparison-toggle" className="text-sm font-medium cursor-pointer">
 Primerjava obdobij
            </Label>
            <Switch
              id="comparison-toggle"
              checked={comparisonEnabled}
              onCheckedChange={setComparisonEnabled}
            />
          </div>
        </div>

        {/* ── Quick Stats Comparison Row ────────────────── */}
        {comparisonEnabled && previousData && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
            {[
              { label: 'Prihodki', curr: report.totalRevenue, prev: previousData.totalRevenue, fmt: 'currency' },
              { label: 'Naročila', curr: report.totalOrders, prev: previousData.totalOrders, fmt: 'number' },
              { label: 'Povp. račun', curr: report.avgOrderValue, prev: previousData.avgOrderValue, fmt: 'currency' },
              { label: 'Neto', curr: report.netRevenue, prev: previousData.netRevenue, fmt: 'currency' },
              { label: 'Popusti', curr: report.totalDiscounts, prev: previousData.totalDiscounts, fmt: 'currency', invert: true },
              { label: 'Preklici', curr: report.totalCancellations, prev: previousData.totalCancellations, fmt: 'number', invert: true },
            ].map((stat) => {
              const delta = stat.prev > 0 ? ((stat.curr - stat.prev) / stat.prev) * 100 : 0;
              const isPositive = stat.invert ? delta < 0 : delta > 0;
              return (
                <Card key={stat.label} className="print-break-inside-avoid">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-base font-bold">
                      {stat.fmt === 'currency' ? `${currency}` : ''}{stat.curr.toLocaleString('sl-SI')}
                    </p>
                    <div className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {Math.abs(delta).toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      prej: {stat.fmt === 'currency' ? currency : ''}{stat.prev.toLocaleString('sl-SI')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Summary Cards with gradient ───────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-break-inside-avoid">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className={`bg-gradient-to-br ${card.gradient} overflow-hidden`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-bold">{formatValue(card.value, card.format)}</p>
                      {comparisonEnabled && card.prevValue != null && (
                        <DeltaArrow current={card.value} previous={card.prevValue} />
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${card.bg}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Additional metrics row ────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-break-inside-avoid">
          <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Popusti</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-amber-600">-{currency}{report.totalDiscounts.toLocaleString('sl-SI')}</span>
                {comparisonEnabled && previousData && (
                  <DeltaArrow current={report.totalDiscounts} previous={previousData.totalDiscounts} invert />
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Preklici</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">{report.totalCancellations}</span>
                {comparisonEnabled && previousData && (
                  <DeltaArrow current={report.totalCancellations} previous={previousData.totalCancellations} invert />
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Neto marža</span>
              </div>
              <span className="text-lg font-bold text-emerald-600">
                {report.totalRevenue > 0 ? ((report.netRevenue / report.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </CardContent>
          </Card>
        </div>

        {/* ── AI Insight Box ───────────────────────────── */}
        <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50/60 via-purple-50/40 to-fuchsia-50/60 dark:from-violet-900/15 dark:via-purple-900/10 dark:to-fuchsia-900/15 print-break-inside-avoid">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Povzetek poročila</span>
                  <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                    AI
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Revenue Trend Chart ───────────────────────── */}
        <Card className="print-break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Trend prihodkov
              {comparisonEnabled && (
                <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {comparisonLabels[activePeriodKey]}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={revenueChartRef} className="h-[300px] w-full" data-print-full-width>
              {comparisonEnabled && previousData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="compRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="compPrevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#f59e0b"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name.includes('Prihodki') || name.includes('prihodki')) return [`${currency}${value.toLocaleString('sl-SI')}`, name];
                        return [value.toString(), name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="prevRevenue"
                      name="Prejšnji prihodki"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#compPrevGrad)"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Trenutni prihodki"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#compRevenueGrad)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Naročila"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#f59e0b' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.dailyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reportOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#f59e0b"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Prihodki') return [`${currency}${value.toLocaleString('sl-SI')}`, name];
                        return [value.toString(), name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Prihodki"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#reportRevenueGrad)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Naročila"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#reportOrdersGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Two column: Top Items + Order Type Split ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items Table */}
          <Card className="print-break-inside-avoid">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Najbolj prodajani artikli
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikel</TableHead>
                    <TableHead className="text-right">Količina</TableHead>
                    <TableHead className="text-right">Prihodki</TableHead>
                    {comparisonEnabled && previousData && <TableHead className="text-right">Sprememba</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.topItems.map((item, idx) => {
                    const prevItem = previousData?.topItems[idx];
                    const qtyDelta = prevItem ? ((item.quantity - prevItem.quantity) / prevItem.quantity) * 100 : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-sm border ${item.isVeg ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`} />
                            <div>
                              <span className="font-medium text-sm">{item.name}</span>
                              <p className="text-xs text-muted-foreground">{item.course}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.quantity}x
                          {comparisonEnabled && prevItem && (
                            <span className={`ml-1 text-[10px] ${qtyDelta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              ({qtyDelta >= 0 ? '+' : ''}{qtyDelta.toFixed(0)}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600">
                          {currency}{item.revenue.toLocaleString('sl-SI')}
                        </TableCell>
                        {comparisonEnabled && prevItem && (
                          <TableCell className="text-right">
                            <DeltaArrow current={item.revenue} previous={prevItem.revenue} />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Order Type Split */}
          <Card className="print-break-inside-avoid">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Razdelitev po tipu naročila</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={orderTypeChartRef} className="h-[220px] w-full" data-print-full-width>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.orderTypeSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="type"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {report.orderTypeSplit.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#059669', '#3b82f6', '#f59e0b'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${currency}${value.toLocaleString('sl-SI')}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {report.orderTypeSplit.map((o, idx) => {
                  const prevO = previousData?.orderTypeSplit[idx];
                  return (
                    <div key={o.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ['#059669', '#3b82f6', '#f59e0b'][idx % 3] }} />
                        <span>{o.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{o.count} naročil</span>
                        <span className="font-mono font-medium">{currency}{o.revenue.toLocaleString('sl-SI')}</span>
                        {comparisonEnabled && prevO && (
                          <DeltaArrow current={o.revenue} previous={prevO.revenue} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Payment Split + Course Revenue ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-before">
          {/* Payment Method Split */}
          <Card className="print-break-inside-avoid">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Načini plačila</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full" data-print-full-width>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.paymentSplit} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="method" tick={{ fontSize: 12 }} width={70} />
                    <Tooltip
                      formatter={(value: number) => [`${currency}${value.toLocaleString('sl-SI')}`, 'Znesek']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    />
                    <Bar dataKey="amount" name="Znesek" radius={[0, 4, 4, 0]}>
                      {report.paymentSplit.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {report.paymentSplit.map((p) => {
                  const totalAmount = report.paymentSplit.reduce((sum, p) => sum + p.amount, 0);
                  const percentage = totalAmount > 0 ? ((p.amount / totalAmount) * 100).toFixed(1) : '0';
                  const prevP = previousData?.paymentSplit.find((pp) => pp.method === p.method);
                  return (
                    <div key={p.method} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
                        <span>{p.method}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{p.count} transakcij ({percentage}%)</span>
                        <span className="font-mono font-medium">{currency}{p.amount.toLocaleString('sl-SI')}</span>
                        {comparisonEnabled && prevP && (
                          <DeltaArrow current={p.amount} previous={prevP.amount} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Course Revenue */}
          <Card className="print-break-inside-avoid">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Prihodki po kategorijah</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={courseChartRef} className="h-[200px] w-full" data-print-full-width>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.courseRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'Prihodki') return [`${currency}${value.toLocaleString('sl-SI')}`, name];
                        return [value.toString(), name];
                      }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Prihodki" fill="#059669" radius={[4, 4, 0, 0]}>
                      {report.courseRevenue.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={courseColors[idx % courseColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategorija</TableHead>
                    <TableHead className="text-right">Prihodki</TableHead>
                    <TableHead className="text-right">Artikli</TableHead>
                    {comparisonEnabled && previousData && <TableHead className="text-right">Sprememba</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.courseRevenue.map((c, idx) => {
                    const prevC = previousData?.courseRevenue[idx];
                    return (
                      <TableRow key={c.course}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: courseColors[idx % courseColors.length] }} />
                            <span className="font-medium text-sm">{c.course}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600">
                          {currency}{c.revenue.toLocaleString('sl-SI')}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{c.items}</TableCell>
                        {comparisonEnabled && previousData && prevC && (
                          <TableCell className="text-right">
                            <DeltaArrow current={c.revenue} previous={prevC.revenue} />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* ── Comparison Detail Section ────────────────── */}
        {comparisonEnabled && previousData && (
          <Card className="border-emerald-200 dark:border-emerald-800 print-break-inside-avoid">
            <CardHeader className="pb-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                <GitCompareArrows className="h-5 w-5" />
                Primerjava obdobij — {comparisonLabels[activePeriodKey]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revenue comparison */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Prihodki</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Trenutno obdobje</p>
                      <p className="text-xl font-bold text-emerald-600">{currency}{report.totalRevenue.toLocaleString('sl-SI')}</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">vs</div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Prejšnje obdobje</p>
                      <p className="text-xl font-bold text-muted-foreground">{currency}{previousData.totalRevenue.toLocaleString('sl-SI')}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 rounded-l-full"
                      style={{ width: `${Math.min(100, (report.totalRevenue / Math.max(report.totalRevenue, previousData.totalRevenue)) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-gray-300 dark:bg-gray-600 rounded-r-full"
                      style={{ width: `${Math.min(100, (previousData.totalRevenue / Math.max(report.totalRevenue, previousData.totalRevenue)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Orders comparison */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Naročila</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Trenutno obdobje</p>
                      <p className="text-xl font-bold text-amber-600">{report.totalOrders.toLocaleString('sl-SI')}</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">vs</div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Prejšnje obdobje</p>
                      <p className="text-xl font-bold text-muted-foreground">{previousData.totalOrders.toLocaleString('sl-SI')}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500 rounded-l-full"
                      style={{ width: `${Math.min(100, (report.totalOrders / Math.max(report.totalOrders, previousData.totalOrders)) * 100)}%` }}
                    />
                    <div
                      className="h-full bg-gray-300 dark:bg-gray-600 rounded-r-full"
                      style={{ width: `${Math.min(100, (previousData.totalOrders / Math.max(report.totalOrders, previousData.totalOrders)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
