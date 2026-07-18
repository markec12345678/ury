import type { Meta, StoryObj } from "@storybook/react-vite"
import { Skeleton, MenuCardSkeleton, DashboardCardSkeleton, TableRowSkeleton, ChartSkeleton } from "../skeleton"

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Skeleton loading placeholders that display an animated pulse effect while content is loading. Includes CVA variants for shape (text/circular/rectangular) and animation (pulse/wave/none), plus pre-built layout skeletons for common POS UI patterns like menu cards, dashboard cards, table rows, and charts.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circular", "rectangular"],
      table: { defaultValue: { summary: "text" } },
    },
    animation: {
      control: "select",
      options: ["pulse", "wave", "none"],
      table: { defaultValue: { summary: "pulse" } },
    },
    width: { control: "text" },
    height: { control: "text" },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: {
    className: "h-4 w-48",
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Text</p>
        <Skeleton variant="text" className="h-4 w-64" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Circular</p>
        <Skeleton variant="circular" className="w-12 h-12" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Rectangular</p>
        <Skeleton variant="rectangular" className="h-24 w-full" />
      </div>
    </div>
  ),
}

export const AnimationVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Pulse (default)</p>
        <Skeleton animation="pulse" className="h-4 w-48" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Wave</p>
        <Skeleton animation="wave" className="h-4 w-48" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>None</p>
        <Skeleton animation="none" className="h-4 w-48" />
      </div>
    </div>
  ),
}

export const MenuCard: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "600px" }}>
      <MenuCardSkeleton />
      <MenuCardSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Pre-built skeleton for menu item cards — image, title, subtitle, price, and action button.",
      },
    },
  },
}

export const DashboardCard: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", maxWidth: "800px" }}>
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Pre-built skeleton for dashboard metric cards — label, value, and trend indicator.",
      },
    },
  },
}

export const TableRow: Story = {
  render: () => (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
          <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#999" }}>Item</th>
          <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#999" }}>Qty</th>
          <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#999" }}>Price</th>
          <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#999" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        <TableRowSkeleton columns={4} />
        <TableRowSkeleton columns={4} />
        <TableRowSkeleton columns={4} />
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story: "Pre-built skeleton for table rows — accepts configurable column count.",
      },
    },
  },
}

export const Chart: Story = {
  render: () => <ChartSkeleton />,
  parameters: {
    docs: {
      description: {
        story: "Pre-built skeleton for chart panels — title, chart area, and legend placeholders.",
      },
    },
  },
}
