import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Switch } from "../switch"

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A toggle switch control. Supports controlled and uncontrolled modes, multiple sizes, and optional label.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    onCheckedChange: {
      action: "checkedChange",
    },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {
    label: "Airplane mode",
  },
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
    label: "Notifications",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled option",
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Switch size="sm" label="Small switch" />
      <Switch size="default" label="Default switch" />
      <Switch size="lg" label="Large switch" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Switch checked={checked} onCheckedChange={setChecked} label="Dark mode" />
        <span style={{ fontSize: "0.875rem", color: "#666" }}>
          Status: {checked ? "ON" : "OFF"}
        </span>
      </div>
    )
  },
}

export const FormExample: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        minWidth: "280px",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Preferences</h3>
      <Switch defaultChecked label="Email notifications" />
      <Switch label="SMS notifications" />
      <Switch defaultChecked label="Order updates" />
      <Switch label="Marketing emails" />
    </div>
  ),
}
