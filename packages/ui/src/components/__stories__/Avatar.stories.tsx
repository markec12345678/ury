import type { Meta, StoryObj } from "@storybook/react-vite"
import { Avatar } from "../avatar"

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An avatar component displaying user images or initials. Supports multiple sizes, shapes, status indicators, and color variants for fallback.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl"],
    },
    shape: {
      control: "select",
      options: ["circle", "square"],
    },
    color: {
      control: "select",
      options: ["default", "primary", "success", "warning", "danger", "info"],
    },
    status: {
      control: "select",
      options: ["online", "offline", "busy", "away"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    fallback: "JD",
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Avatar size="xs" fallback="XS" />
      <Avatar size="sm" fallback="SM" />
      <Avatar size="default" fallback="DF" />
      <Avatar size="lg" fallback="LG" />
      <Avatar size="xl" fallback="XL" />
    </div>
  ),
}

export const WithImage: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Avatar
        src="https://i.pravatar.cc/100?img=1"
        fallback="JD"
        alt="John Doe"
        size="lg"
      />
      <Avatar
        src="https://i.pravatar.cc/100?img=5"
        fallback="JS"
        alt="Jane Smith"
        size="lg"
      />
      <Avatar
        src="https://invalid-url.example.com/broken.jpg"
        fallback="AB"
        alt="Fallback shown"
        size="lg"
      />
    </div>
  ),
}

export const AllColors: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Avatar fallback="DF" color="default" />
      <Avatar fallback="PR" color="primary" />
      <Avatar fallback="SC" color="success" />
      <Avatar fallback="WN" color="warning" />
      <Avatar fallback="DN" color="danger" />
      <Avatar fallback="IN" color="info" />
    </div>
  ),
}

export const WithStatus: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <Avatar fallback="ON" status="online" size="lg" />
      <Avatar fallback="OF" status="offline" size="lg" />
      <Avatar fallback="BS" status="busy" size="lg" />
      <Avatar fallback="AW" status="away" size="lg" />
    </div>
  ),
}

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <Avatar fallback="CI" shape="circle" size="lg" />
      <Avatar fallback="SQ" shape="square" size="lg" />
    </div>
  ),
}

export const AvatarGroup: Story = {
  render: () => (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "flex-end",
        }}
      >
        {["AB", "CD", "EF", "GH"].map((initials, i) => (
          <div
            key={initials}
            style={{
              marginLeft: i > 0 ? "-0.5rem" : 0,
              border: "2px solid white",
              borderRadius: "9999px",
              zIndex: 4 - i,
              position: "relative",
            }}
          >
            <Avatar
              fallback={initials}
              size="default"
              color={(["primary", "success", "warning", "danger"] as const)[i]}
            />
          </div>
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.5rem" }}>
        4 team members
      </p>
    </div>
  ),
}
