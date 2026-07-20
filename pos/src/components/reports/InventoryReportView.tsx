import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useReportsStore, InventoryReport } from '../../store/reports-store';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Badge } from '../ui';
import { t } from '../../i18n';

const InventoryReportView = () => {
  // R41-FIX: Use individual Zustand selector instead of useReportsStore()
  const inventoryReport = useReportsStore((s) => s.inventoryReport);

  // Show explicit no-data state when there is no report data
  if (!inventoryReport) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Package className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">
          {t('reports.inventory.noData')}
        </p>
        <p className="text-sm mt-1">
          {t('reports.inventory.noDataHint')}
        </p>
      </div>
    );
  }

  const { summary, items } = inventoryReport;

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OK':
        return 'success';
      case 'Low':
        return 'warning';
      case 'Out of Stock':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <Package className="w-3 h-3" />;
      case 'Low':
        return <AlertTriangle className="w-3 h-3" />;
      case 'Out of Stock':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title={t('reports.inventory.totalItems')}
          value={`${summary.total_items}`}
          icon={<Package className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
        <SummaryCard
          title={t('reports.inventory.lowStock')}
          value={`${summary.low_stock_items}`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <SummaryCard
          title={t('reports.inventory.outOfStock')}
          value={`${summary.out_of_stock_items}`}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="red"
        />
        <SummaryCard
          title={t('reports.inventory.totalValue')}
          value={formatCurrency(summary.total_stock_value)}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          color="emerald"
        />
      </div>

      {/* Low Stock Alert */}
      {(summary.low_stock_items > 0 || summary.out_of_stock_items > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {summary.out_of_stock_items > 0 && (
                <>{summary.out_of_stock_items} {t('reports.inventory.outOfStockAlert')}</>
              )}
              {summary.out_of_stock_items > 0 && summary.low_stock_items > 0 && ' • '}
              {summary.low_stock_items > 0 && (
                <>{summary.low_stock_items} {t('reports.inventory.lowStockAlert')}</>
              )}
            </p>
            <p className="text-xs text-amber-600">
              {t('reports.inventory.reorderNote')}
            </p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t('reports.inventory.stockLevels')}
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-200">
                <th className="text-start py-2 px-3 text-gray-500 font-medium">{t('reports.inventory.item')}</th>
                <th className="text-end py-2 px-3 text-gray-500 font-medium">{t('reports.inventory.currentStock')}</th>
                <th className="text-end py-2 px-3 text-gray-500 font-medium">{t('reports.inventory.reorderLevel')}</th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">{t('reports.inventory.status')}</th>
                <th className="text-start py-2 px-3 text-gray-500 font-medium">{t('reports.inventory.unit')}</th>
                <th className="text-end py-2 px-3 text-gray-500 font-medium">{t('reports.inventory.value')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.item_code}
                  className={cn(
                    'border-b border-gray-50 hover:bg-gray-50 transition-colors',
                    item.status === 'Out of Stock' && 'bg-red-50/50',
                    item.status === 'Low' && 'bg-amber-50/30'
                  )}
                >
                  <td className="py-2 px-3 font-medium text-gray-900">{item.item_name}</td>
                  <td className={cn(
                    'py-2 px-3 text-end font-medium',
                    item.status === 'Out of Stock' && 'text-red-600',
                    item.status === 'Low' && 'text-amber-600',
                    item.status === 'OK' && 'text-gray-900'
                  )}>
                    {item.current_stock}
                  </td>
                  <td className="py-2 px-3 text-end text-gray-500">{item.reorder_level}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge
                      variant={statusBadgeVariant(item.status)}
                      size="sm"
                      className="inline-flex items-center gap-1"
                    >
                      {statusIcon(item.status)}
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-gray-500">{item.stock_uom}</td>
                  <td className="py-2 px-3 text-end font-medium">{formatCurrency(item.stock_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Summary card component
const SummaryCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
  };

  return (
    <div className={cn('rounded-lg border p-4', colorMap[color] || 'bg-gray-50 border-gray-100')}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{title}</p>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default InventoryReportView;
