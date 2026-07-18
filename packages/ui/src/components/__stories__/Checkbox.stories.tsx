import type { Meta, StoryObj } from "@storybook/react-vite"
import { Checkbox } from "../checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A checkbox control with label and description support. Supports controlled/uncontrolled modes, multiple sizes and variants, and is fully accessible with ARIA attributes.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger"],
    },
    onCheckedChange: {
      action: "checkedChange",
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
    label: "Subscribe to newsletter",
  },
}

export const WithDescription: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Checkbox
        defaultChecked
        label="Email notifications"
        description="Get notified when someone places an order"
      />
      <Checkbox
        label="SMS notifications"
        description="Receive text alerts for critical events"
      />
      <Checkbox
        defaultChecked
        label="Marketing emails"
        description="Updates about new features and promotions"
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Checkbox disabled label="Disabled unchecked" />
      <Checkbox disabled defaultChecked label="Disabled checked" />
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="default" label="Default checkbox" />
      <Checkbox size="lg" label="Large checkbox" />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Checkbox variant="default" defaultChecked label="Default" />
      <Checkbox variant="success" defaultChecked label="Confirmed" />
      <Checkbox variant="warning" defaultChecked label="Pending review" />
      <Checkbox variant="danger" defaultChecked label="Rejected" />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div
      style={{
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        maxWidth: "360px",
      }}
    >
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
        Order Preferences
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Checkbox defaultChecked label="Dine-in" description="Allow dine-in orders" />
        <Checkbox defaultChecked label="Takeaway" description="Allow takeaway orders" />
        <Checkbox label="Delivery" description="Allow delivery orders" />
        <Checkbox variant="success" defaultChecked label="Auto-accept" description="Accept orders automatically" />
      </div>
    </div>
  ),
}
