import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useAccordionItem,
} from '../accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const items = [
  { value: 'item-1', title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern and includes proper ARIA attributes for accordion widgets.' },
  { value: 'item-2', title: 'Is it styled?', content: 'Yes. It comes with three variants — default, outline, and card — each with consistent spacing and typography.' },
  { value: 'item-3', title: 'Is it animated?', content: 'Yes. Items expand and collapse with smooth transitions. The chevron icon rotates to indicate open/closed state.' },
];

export const Default: Story = {
  render: () => (
    <Accordion defaultValue={['item-1']}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTriggerWrapper value={item.value}>
            {item.title}
          </AccordionTriggerWrapper>
          <AccordionContentWrapper value={item.value}>
            {item.content}
          </AccordionContentWrapper>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

// Helper wrappers that connect the accordion item value
function AccordionTriggerWrapper({ value, children }: { value: string; children: React.ReactNode }) {
  const { isOpen, toggle } = useAccordionItem(value);
  return (
    <AccordionTrigger
      aria-expanded={isOpen}
      onClick={toggle}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </AccordionTrigger>
  );
}

function AccordionContentWrapper({ value, children }: { value: string; children: React.ReactNode }) {
  const { isOpen } = useAccordionItem(value);
  if (!isOpen) return null;
  return <AccordionContent>{children}</AccordionContent>;
}

import * as React from 'react';

export const Outline: Story = {
  render: () => (
    <Accordion variant="outline" defaultValue={['item-1']}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTriggerWrapper value={item.value}>
            {item.title}
          </AccordionTriggerWrapper>
          <AccordionContentWrapper value={item.value}>
            {item.content}
          </AccordionContentWrapper>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Card: Story = {
  render: () => (
    <Accordion variant="card" defaultValue={['item-1']}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTriggerWrapper value={item.value}>
            {item.title}
          </AccordionTriggerWrapper>
          <AccordionContentWrapper value={item.value}>
            {item.content}
          </AccordionContentWrapper>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <Accordion variant="outline" multiple defaultValue={['item-1', 'item-2']}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTriggerWrapper value={item.value}>
            {item.title}
          </AccordionTriggerWrapper>
          <AccordionContentWrapper value={item.value}>
            {item.content}
          </AccordionContentWrapper>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['item-1']);
    return (
      <div>
        <Accordion value={value} onValueChange={setValue}>
          {items.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTriggerWrapper value={item.value}>
                {item.title}
              </AccordionTriggerWrapper>
              <AccordionContentWrapper value={item.value}>
                {item.content}
              </AccordionContentWrapper>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-4 text-sm text-gray-500">Open: {value.join(', ') || 'none'}</p>
      </div>
    );
  },
};
