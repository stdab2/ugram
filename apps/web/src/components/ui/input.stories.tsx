import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
	title: "UI/Input",
	component: Input,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		type: "text",
		placeholder: "Enter text...",
	},
};

export const WithLabel: Story = {
	render: () => (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="email">Email</Label>
			<Input type="email" id="email" placeholder="Email" />
		</div>
	),
};

export const Disabled: Story = {
	args: {
		type: "text",
		placeholder: "Disabled",
		disabled: true,
	},
};

export const Password: Story = {
	args: {
		type: "password",
		placeholder: "Password",
	},
};
