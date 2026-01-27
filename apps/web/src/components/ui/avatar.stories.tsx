import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const meta = {
	title: "UI/Avatar",
	component: Avatar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	),
};

export const Fallback: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="/nonexistent.png" alt="Avatar" />
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	),
};

export const WithoutImage: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>AB</AvatarFallback>
		</Avatar>
	),
};
