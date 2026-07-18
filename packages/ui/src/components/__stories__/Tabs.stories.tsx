import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Tabs, type TabItem } from "../tabs"

const sampleTabs: TabItem[] = [
  {
    value: "overview",
    label: "Overview",
    content: (
      <div style={{ padding: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Dashboard Overview</h3>
        <p style={{ margin: 0, color: "#666" }}>
          View your key metrics including daily revenue, orders, and customer count.
        </p>
      </div>
    ),
  },
  {
    value: "orders",
    label: "Orders",
    content: (
      <div style={{ padding: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Recent Orders</h3>
        <p style={{ margin: 0, color: "#666" }}>
          42 orders today. 5 pending, 3 in progress, 34 completed.
        </p>
      </div>
    ),
  },
  {
    value: "analytics",
    label: "Analytics",
    content: (
      <div style={{ padding: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Sales Analytics</h3>
        <p style={{ margin: 0, color: "#666" }}>
          Revenue is up 12% compared to last week. Best seller: Margherita Pizza.
        </p>
      </div>
    ),
  },
]

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A tabbed interface component with multiple style variants. Supports controlled/uncontrolled modes, icons, disabled tabs, and is fully accessible with ARIA tab roles.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "pill"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    onValueChange: {
      action: "valueChange",
    },
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  args: {
    tabs: sampleTabs,
  },
}

export const Outline: Story = {
  args: {
    tabs: sampleTabs,
    variant: "outline",
  },
}

export const Pill: Story = {
  args: {
    tabs: sampleTabs,
    variant: "pill",
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", minWidth: "400px" }}>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.5rem" }}>Small</p>
        <Tabs tabs={sampleTabs} size="sm" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.5rem" }}>Default</p>
        <Tabs tabs={sampleTabs} size="default" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.5rem" }}>Large</p>
        <Tabs tabs={sampleTabs} size="lg" />
      </div>
    </div>
  ),
}

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      ...sampleTabs,
      {
        value: "settings",
        label: "Settings",
        disabled: true,
        content: <div>Settings content (disabled)</div>,
      },
    ],
  },
}

export const WithIcons: Story = {
  args: {
    variant: "pill",
    tabs: [
      {
        value: "dashboard",
        label: "Dashboard",
        icon: <span>📊</span>,
        content: <div style={{ padding: "1rem" }}>Dashboard content here</div>,
      },
      {
        value: "menu",
        label: "Menu",
        icon: <span>🍽️</span>,
        content: <div style={{ padding: "1rem" }}>Menu management content</div>,
      },
      {
        value: "kitchen",
        label: "Kitchen",
        icon: <span>👨‍🍳</span>,
        content: <div style={{ padding: "1rem" }}>Kitchen display content</div>,
      },
    ],
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("overview")
    return (
      <div style={{ minWidth: "400px" }}>
        <Tabs tabs={sampleTabs} value={value} onValueChange={setValue} />
        <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.5rem" }}>
          Active tab: <strong>{value}</strong>
        </p>
      </div>
    )
  },
}
