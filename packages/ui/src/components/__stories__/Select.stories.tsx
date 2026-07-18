import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectItem } from '../select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    error: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => (
    <div className="w-64">
      <Select placeholder="Choose a restaurant" {...args}>
        <SelectItem value="italian">Italian Kitchen</SelectItem>
        <SelectItem value="sushi">Sushi Bar</SelectItem>
        <SelectItem value="steak">Steakhouse</SelectItem>
        <SelectItem value="vegan">Green Garden</SelectItem>
        <SelectItem value="seafood">Ocean Breeze</SelectItem>
      </Select>
    </div>
  ),
};

export const WithPreselected: Story = {
  render: () => (
    <div className="w-64">
      <Select defaultValue="sushi" placeholder="Choose a restaurant">
        <SelectItem value="italian">Italian Kitchen</SelectItem>
        <SelectItem value="sushi">Sushi Bar</SelectItem>
        <SelectItem value="steak">Steakhouse</SelectItem>
        <SelectItem value="vegan">Green Garden</SelectItem>
      </Select>
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="w-64">
      <Select error placeholder="Select a table" variant="error">
        <SelectItem value="t1">Table 1 - Window</SelectItem>
        <SelectItem value="t2">Table 2 - Corner</SelectItem>
        <SelectItem value="t3">Table 3 - Bar</SelectItem>
      </Select>
      <p className="mt-1 text-xs text-red-500">Please select a table to continue</p>
    </div>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <div className="w-48">
      <Select size="sm" placeholder="Order type">
        <SelectItem value="dine-in">Dine In</SelectItem>
        <SelectItem value="takeaway">Takeaway</SelectItem>
        <SelectItem value="delivery">Delivery</SelectItem>
      </Select>
    </div>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <div className="w-80">
      <Select size="lg" placeholder="Select a production unit">
        <SelectItem value="main">Main Kitchen</SelectItem>
        <SelectItem value="bar">Bar Station</SelectItem>
        <SelectItem value="dessert">Dessert Station</SelectItem>
        <SelectItem value="grill">Grill Station</SelectItem>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Select disabled placeholder="Cannot select">
        <SelectItem value="1">Option 1</SelectItem>
        <SelectItem value="2">Option 2</SelectItem>
      </Select>
    </div>
  ),
};

export const ManyOptions: Story = {
  render: () => (
    <div className="w-64">
      <Select placeholder="Select menu category">
        <SelectItem value="appetizers">Appetizers</SelectItem>
        <SelectItem value="soups">Soups</SelectItem>
        <SelectItem value="salads">Salads</SelectItem>
        <SelectItem value="pasta">Pasta</SelectItem>
        <SelectItem value="pizza">Pizza</SelectItem>
        <SelectItem value="grills">Grills & BBQ</SelectItem>
        <SelectItem value="seafood">Seafood</SelectItem>
        <SelectItem value="desserts">Desserts</SelectItem>
        <SelectItem value="beverages">Beverages</SelectItem>
        <SelectItem value="specials">Chef Specials</SelectItem>
      </Select>
    </div>
  ),
};
