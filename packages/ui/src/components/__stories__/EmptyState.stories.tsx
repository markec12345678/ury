import type { Meta, StoryObj } from "@storybook/react-vite"
import { EmptyState } from "../empty-state"
import { ShoppingCart, ClipboardList, BarChart3, Search } from "lucide-react"

const meta: Meta<typeof EmptyState> = {
  title: "UI/Empty State",
  component: EmptyState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Empty state placeholder displayed when there is no data to show. Provides a consistent look across the app for empty lists, tables, and dashboards. Supports three sizes (sm/md/lg), an optional Lucide icon, title, description, and call-to-action. Fully accessible with role='status'.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    icon: ShoppingCart,
    title: "No orders yet",
    description: "Orders will appear here once customers start placing them.",
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Small</p>
        <EmptyState
          icon={ShoppingCart}
          title="No items"
          description="Your cart is empty."
          size="sm"
        />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Medium (default)</p>
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Orders will appear here once customers start placing them."
          size="md"
        />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Large</p>
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Orders will appear here once customers start placing them."
          size="lg"
        />
      </div>
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <EmptyState
      icon={ClipboardList}
      title="No menu items"
      description="Add your first menu item to get started with order management."
      action={
        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Add Menu Item
        </button>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state with a call-to-action button to guide the user to the next step.",
      },
    },
  },
}

export const NoData: Story = {
  render: () => (
    <EmptyState
      icon={BarChart3}
      title="No data available"
      description="Reports will populate once you have at least one completed order."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state for dashboard/report views where data hasn't accumulated yet.",
      },
    },
  },
}

export const SearchEmpty: Story = {
  render: () => (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      size="sm"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Compact empty state for search results — uses the 'sm' size variant.",
      },
    },
  },
}
