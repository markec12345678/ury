import { useEffect, useState } from 'react';
import { usePOSStore } from '../store/pos-store';
import { t } from '../i18n';
import { Select, SelectItem } from './ui/select';
import { getAggregators, type Aggregator } from '../lib/aggregator-api';
import { showToast } from './ui/toast';

interface AggregatorSelectProps {
  disabled?: boolean;
}

export function AggregatorSelect({ disabled }: AggregatorSelectProps) {
  const selectedAggregator = usePOSStore((s) => s.selectedAggregator);
  const setSelectedAggregator = usePOSStore((s) => s.setSelectedAggregator);
  const fetchAggregatorMenu = usePOSStore((s) => s.fetchAggregatorMenu);
  const [aggregators, setAggregators] = useState<Aggregator[]>([]);
  const [loading, setLoading] = useState(false);
  // R43-FIX: Add error state so users see feedback when the API fails
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAggregatorsList = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAggregators();
        if (!cancelled) setAggregators(data);
      } catch (error) {
        // R43-FIX: Set error state so users see feedback in production
        if (!cancelled) setError(t('aggregator.failed_load'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAggregatorsList();
    return () => { cancelled = true; };
  }, []);

  const handleAggregatorChange = async (value: string) => {
    const aggregator = aggregators.find(a => a.customer === value);
    setSelectedAggregator(aggregator || null);

    if (aggregator) {
      // R43-FIX: Show error toast if aggregator menu fetch fails
      try {
        await fetchAggregatorMenu(aggregator.customer);
      } catch {
        showToast.error(t('aggregator.failed_load_menu'));
      }
    }
  };

  return (
    <div>
      <Select
        value={selectedAggregator?.customer || ''}
        onValueChange={handleAggregatorChange}
        disabled={disabled || loading}
        placeholder={loading ? t('aggregator.loading') : error ? t('aggregator.retry_placeholder') : t('aggregator.select_placeholder')}
      >
        {aggregators.map((aggregator) => (
          <SelectItem 
            key={aggregator.customer} 
            value={aggregator.customer}
            className="capitalize"
          >
            {aggregator.customer}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
} 