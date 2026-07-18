import type { Meta, StoryObj } from '@storybook/react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../command';

const meta: Meta<typeof Command> = {
  title: 'Components/Command',
  component: Command,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Command>;

const menuItems = [
  { group: 'Suggestions', items: ['Calendar', 'Search Emoji', 'Calculator'] },
  { group: 'Settings', items: ['Profile', 'Billing', 'Settings', 'Keyboard shortcuts'] },
];

export const Default: Story = {
  render: () => (
    <Command className="max-w-sm">
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {menuItems.map((group) => (
          <React.Fragment key={group.group}>
            <CommandGroup heading={group.group}>
              {group.items.map((item) => (
                <CommandItem key={item} value={item} onSelect={() => console.log('Selected:', item)}>
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </Command>
  ),
};

export const Ghost: Story = {
  render: () => (
    <Command variant="ghost" className="max-w-sm">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Items">
          {['Item 1', 'Item 2', 'Item 3'].map((item) => (
            <CommandItem key={item} value={item}>
              {item}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithKeywords: Story = {
  render: () => (
    <Command className="max-w-sm">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem value="new-file" keywords={['create', 'new', 'document']}>
            New File
          </CommandItem>
          <CommandItem value="open-file" keywords={['open', 'load', 'import']}>
            Open File
          </CommandItem>
          <CommandItem value="save-file" keywords={['save', 'export', 'write']}>
            Save File
          </CommandItem>
          <CommandItem value="delete-file" keywords={['delete', 'remove', 'trash']}>
            Delete File
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Command className="max-w-sm">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandGroup heading="Options">
          <CommandItem value="enabled">Enabled Option</CommandItem>
          <CommandItem value="disabled" disabled>
            Disabled Option
          </CommandItem>
          <CommandItem value="another">Another Option</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [query, setQuery] = React.useState('');
    return (
      <div>
        <Command className="max-w-sm" value={query} onValueChange={setQuery}>
          <CommandInput placeholder="Type to search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Results">
              {['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'].map((item) => (
                <CommandItem key={item} value={item}>
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <p className="mt-2 text-sm text-gray-500">Query: "{query}"</p>
      </div>
    );
  },
};

import * as React from 'react';
