import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "../components/layout/Header";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {};
