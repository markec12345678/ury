import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '../progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Progress bar component for the URY POS system. Displays a horizontal progress indicator with configurable size, color variant, optional percentage label, striped pattern, and animation. Used for order progress, kitchen queue status, and dashboard metrics.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
      description: 'Color variant of the progress bar',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Height of the progress bar',
      table: { defaultValue: { summary: 'md' } },
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'Current progress value (0-max)',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage label inside the bar (lg/xl only)',
    },
    striped: {
      control: 'boolean',
      description: 'Show striped pattern on the bar',
    },
    animate: {
      control: 'boolean',
      description: 'Animate the bar fill with a pulse effect',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 65,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <p className="text-xs text-gray-400 mb-1">Default</p>
        <Progress variant="default" value={70} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Success</p>
        <Progress variant="success" value={85} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Warning</p>
        <Progress variant="warning" value={50} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Danger</p>
        <Progress variant="danger" value={25} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Info</p>
        <Progress variant="info" value={60} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Five color variants for different semantic contexts.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <p className="text-xs text-gray-400 mb-1">Small</p>
        <Progress size="sm" value={60} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Medium</p>
        <Progress size="md" value={60} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Large</p>
        <Progress size="lg" value={60} showLabel />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Extra Large</p>
        <Progress size="xl" value={60} showLabel />
      </div>
    </div>
  ),
};

export const Striped: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <Progress variant="default" value={70} striped />
      <Progress variant="success" value={85} striped />
      <Progress variant="danger" value={25} striped />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Striped pattern for active/processing states.',
      },
    },
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <Progress size="xl" value={75} showLabel variant="success" />
      <Progress size="lg" value={42} showLabel variant="warning" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Percentage label shown inside the bar (only visible on lg and xl sizes when value > 10%).',
      },
    },
  },
};

export const POSKitchenQueue: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="text-sm font-medium">Kitchen Queue</div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Order #1024</span>
            <span>3/4 items ready</span>
          </div>
          <Progress variant="success" value={75} size="sm" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Order #1025</span>
            <span>1/3 items ready</span>
          </div>
          <Progress variant="warning" value={33} size="sm" striped animate />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Order #1026</span>
            <span>0/2 items ready</span>
          </div>
          <Progress variant="danger" value={0} size="sm" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Progress bars as used in the POS kitchen queue view — tracking order completion with semantic colors.',
      },
    },
  },
};
