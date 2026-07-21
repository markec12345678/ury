import { useReportsStore } from '../../store/reports-store';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { t } from '../../i18n';

const ProfitLossView = () => {
  // R41-FIX: Use individual Zustand selector instead of useReportsStore()
  const profitLossReport = useReportsStore((s) => s.profitLossReport);

  if (!profitLossReport) {
    return (
      <div className="text-center py-12 text-gray-400">
        {t('reports.select_period_profit_loss')}
      </div>
    );
  }

  const {
    total_revenue,
    cost_of_goods,
    gross_profit,
    fixed_expenses,
    variable_expenses,
    total_expenses,
    net_profit,
    profit_margin,
  } = profitLossReport;

  // R51-FIX: Guard against NaN/Infinity from backend (e.g. division by zero
  // when total_revenue is 0). Without this, Math.abs(NaN)% breaks the progress
  // bar width and displays NaN% to the user.
  const safeMargin = Number.isFinite(profit_margin) ? profit_margin : 0;
  const isProfitable = net_profit >= 0;

  return (
    <div className="space-y-6">
      {/* P&L Summary */}
      <div
        className={`rounded-xl p-6 ${
          isProfitable
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{t('reports.net_profit')}</h3>
          {isProfitable ? (
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-500" />
          )}
        </div>
        <p
          className={`text-3xl font-bold ${
            isProfitable ? 'text-emerald-700' : 'text-red-700'
          }`}
        >
          {formatCurrency(net_profit)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {t('reports.profit_margin')}: {safeMargin.toFixed(1)}%
        </p>
      </div>

      {/* P&L Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Revenue Section */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('reports.revenue')}
          </h4>
          <PLRow label={t('reports.total_revenue')} value={total_revenue} bold />
        </div>

        {/* Cost Section */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('reports.cost_of_goods')}
          </h4>
          <PLRow label={t('reports.cogs')} value={-cost_of_goods} negative />
          <div className="border-t border-gray-200 mt-2 pt-2">
            <PLRow label={t('reports.gross_profit')} value={gross_profit} bold highlight={gross_profit >= 0} />
          </div>
        </div>

        {/* Expenses Section */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('reports.operating_expenses')}
          </h4>
          <PLRow label={t('reports.fixed_expenses')} value={-fixed_expenses} negative />
          <PLRow label={t('reports.variable_expenses')} value={-variable_expenses} negative />
          <div className="border-t border-gray-200 mt-2 pt-2">
            <PLRow label={t('reports.total_expenses')} value={-total_expenses} negative bold />
          </div>
        </div>

        {/* Net Profit Section */}
        <div
          className={`p-4 ${
            isProfitable ? 'bg-emerald-50' : 'bg-red-50'
          }`}
        >
          <PLRow
            label={t('reports.net_profit')}
            value={net_profit}
            bold
            large
            highlight={isProfitable}
          />
          <div className="flex items-center gap-2 mt-1 ms-4">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isProfitable ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(safeMargin), 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{safeMargin.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// P&L Row component
const PLRow = ({
  label,
  value,
  bold = false,
  negative = false,
  large = false,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  negative?: boolean;
  large?: boolean;
  highlight?: boolean;
}) => {
  const getColor = () => {
    if (highlight === true) return 'text-emerald-700';
    if (highlight === false) return 'text-red-600';
    if (negative) return 'text-red-500';
    return 'text-gray-900';
  };

  return (
    <div className="flex items-center justify-between py-1.5 px-4">
      <span
        className={`${bold ? 'font-semibold' : 'font-medium'} ${
          large ? 'text-lg' : 'text-sm'
        } text-gray-700`}
      >
        {label}
      </span>
      <span
        className={`${bold ? 'font-bold' : 'font-medium'} ${
          large ? 'text-xl' : 'text-sm'
        } ${getColor()}`}
      >
        {value < 0 ? '-' : ''}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
};

export default ProfitLossView;
