import type { Meta, StoryObj } from "@storybook/react-vite"
import { Separator } from "../separator"

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A visual separator that divides content sections. Supports horizontal/vertical orientations, labeled separators, and multiple visual variants.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "select",
      options: ["default", "strong", "subtle", "dashed"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Default: Story = {
  render: () => (
    <div>
      <p>Content above the separator</p>
      <Separator className="my-4" />
      <p>Content below the separator</p>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Default</p>
        <Separator variant="default" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Strong</p>
        <Separator variant="strong" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Subtle</p>
        <Separator variant="subtle" />
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#999", margin: "0 0 0.5rem" }}>Dashed</p>
        <Separator variant="dashed" />
      </div>
    </div>
  ),
}

export const Labeled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Separator label="OR" />
      <Separator label="Section Title" />
      <Separator label="Continue with" />
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", height: "80px", gap: "1rem" }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Center</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div style={{ maxWidth: "400px" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600 }}>
        Order Summary
      </h3>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
        3 items in your cart
      </p>
      <Separator className="my-3" />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <span>Subtotal</span>
        <span>$45.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <span>Tax</span>
        <span>$4.50</span>
      </div>
      <Separator className="my-3" variant="dashed" />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
        <span>Total</span>
        <span>$49.50</span>
      </div>
    </div>
  ),
}
