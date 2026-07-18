import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Calendar } from '../calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: () => {
    const [value, onChange] = useState<Date | undefined>(undefined);
    return <Calendar value={value} onChange={onChange} />;
  },
};

export const Preselected: Story = {
  render: () => {
    const [value, onChange] = useState<Date>(new Date(2025, 6, 15));
    return <Calendar value={value} onChange={onChange} />;
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [value, onChange] = useState<Date | undefined>(undefined);
    const minDate = new Date(2025, 6, 1);
    const maxDate = new Date(2025, 6, 31);
    return <Calendar value={value} onChange={onChange} minDate={minDate} maxDate={maxDate} />;
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, onChange] = useState<Date | undefined>(undefined);
    const [month, setMonth] = useState(6);
    const [year, setYear] = useState(2025);
    return (
      <div className="space-y-4">
        <Calendar value={value} onChange={onChange} viewMonth={month} viewYear={year} />
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm rounded border" onClick={() => { setMonth(month === 0 ? 11 : month - 1); if (month === 0) setYear(year - 1); }}>Prev</button>
          <button className="px-3 py-1 text-sm rounded border" onClick={() => { setMonth(month === 11 ? 0 : month + 1); if (month === 11) setYear(year + 1); }}>Next</button>
        </div>
      </div>
    );
  },
};

export const Today: Story = {
  render: () => {
    const [value, onChange] = useState<Date | undefined>(undefined);
    return <Calendar value={value} onChange={onChange} />;
  },
};
