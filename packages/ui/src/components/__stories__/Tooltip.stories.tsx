import type { Meta, StoryObj } from "@storybook/react-vite"
import { Tooltip } from "../tooltip"
import { Button } from "../button"

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A lightweight tooltip that appears on hover or focus. Supports multiple sides, alignments, and color variants.",
      },
    },
  },
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    variant: {
      control: "select",
      options: ["default", "dark", "light", "success", "warning", "danger"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    content: "This is a tooltip",
    side: "top",
    children: <Button>Hover me</Button>,
  },
}

export const AllSides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center", padding: "3rem" }}>
      <Tooltip content="Top tooltip" side="top">
        <Button variant="outline">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button variant="outline">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <Button variant="outline">Left</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <Button variant="outline">Right</Button>
      </Tooltip>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Tooltip content="Default tooltip" variant="default">
        <Button variant="outline">Default</Button>
      </Tooltip>
      <Tooltip content="Dark tooltip" variant="dark">
        <Button variant="outline">Dark</Button>
      </Tooltip>
      <Tooltip content="Light tooltip" variant="light">
        <Button variant="outline">Light</Button>
      </Tooltip>
      <Tooltip content="Success tooltip" variant="success">
        <Button variant="outline">Success</Button>
      </Tooltip>
      <Tooltip content="Warning tooltip" variant="warning">
        <Button variant="outline">Warning</Button>
      </Tooltip>
      <Tooltip content="Danger tooltip" variant="danger">
        <Button variant="outline">Danger</Button>
      </Tooltip>
    </div>
  ),
}

export const WithAlignment: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", padding: "3rem" }}>
      <Tooltip content="Aligned start" side="bottom" align="start">
        <Button variant="outline">Start</Button>
      </Tooltip>
      <Tooltip content="Aligned center" side="bottom" align="center">
        <Button variant="outline">Center</Button>
      </Tooltip>
      <Tooltip content="Aligned end" side="bottom" align="end">
        <Button variant="outline">End</Button>
      </Tooltip>
    </div>
  ),
}

export const RichContent: Story = {
  args: {
    content: (
      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: 600 }}>Keyboard shortcuts</div>
        <div style={{ opacity: 0.8, marginTop: 4 }}>
          <kbd>Ctrl</kbd> + <kbd>K</kbd> — Search
          <br />
          <kbd>Ctrl</kbd> + <kbd>N</kbd> — New order
        </div>
      </div>
    ),
    side: "bottom",
    variant: "dark",
    children: <Button variant="outline">Keyboard shortcuts</Button>,
  },
}
