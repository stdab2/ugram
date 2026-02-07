import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	CircleFadingArrowUpIcon,
	ArrowUpRightIcon,
	GitBranch,
	GitFork,
	ArrowUpIcon,
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarPlusIcon,
	ClockIcon,
	ListFilterIcon,
	MailCheckIcon,
	MoreHorizontalIcon,
	TagIcon,
	Trash2Icon,
} from "lucide-react";

const meta = {
	title: "UI/Button",
	component: Button,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
		},
		size: {
			control: "select",
			options: ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"],
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual variants
export const Default: Story = {
	args: {
		children: "Button",
		variant: "default",
	},
};

export const Destructive: Story = {
	args: {
		children: "Destructive",
		variant: "destructive",
	},
};

export const Outline: Story = {
	args: {
		children: "Outline",
		variant: "outline",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary",
		variant: "secondary",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost",
		variant: "ghost",
	},
};

export const Link: Story = {
	args: {
		children: "Link",
		variant: "link",
	},
};

// All variants showcase
export const AllVariants: Story = {
	render: () => (
		<div className="flex gap-4 flex-wrap">
			<Button variant="default">Default</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="link">Link</Button>
			<Button variant="outline" size="icon" aria-label="Icon">
				<CircleFadingArrowUpIcon />
			</Button>
		</div>
	),
};

// All sizes showcase (similar to shadcn example)
export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col items-start gap-8 sm:flex-row">
			<div className="flex items-start gap-2">
				<Button size="xs" variant="outline">
					Extra Small
				</Button>
				<Button size="icon-xs" aria-label="Submit" variant="outline">
					<ArrowUpRightIcon />
				</Button>
			</div>
			<div className="flex items-start gap-2">
				<Button size="sm" variant="outline">
					Small
				</Button>
				<Button size="icon-sm" aria-label="Submit" variant="outline">
					<ArrowUpRightIcon />
				</Button>
			</div>
			<div className="flex items-start gap-2">
				<Button variant="outline">Default</Button>
				<Button size="icon" aria-label="Submit" variant="outline">
					<ArrowUpRightIcon />
				</Button>
			</div>
			<div className="flex items-start gap-2">
				<Button variant="outline" size="lg">
					Large
				</Button>
				<Button size="icon-lg" aria-label="Submit" variant="outline">
					<ArrowUpRightIcon />
				</Button>
			</div>
		</div>
	),
};

// Buttons with icons
export const WithIcon: Story = {
	render: () => (
		<div className="flex gap-2">
			<Button variant="outline">
				<GitBranch data-icon="inline-start" /> New Branch
			</Button>
			<Button variant="outline">
				Fork
				<GitFork data-icon="inline-end" />
			</Button>
		</div>
	),
};

// Fully rounded buttons
export const Rounded: Story = {
	render: () => (
		<div className="flex gap-2">
			<Button className="rounded-full">Get Started</Button>
			<Button variant="outline" size="icon" className="rounded-full" aria-label="Go up">
				<ArrowUpIcon />
			</Button>
		</div>
	),
};

// Button group with dropdown menu
export const Group: Story = {
	render: () => {
		const [label, setLabel] = React.useState("personal");

		return (
			<ButtonGroup>
				<ButtonGroup className="hidden sm:flex">
					<Button variant="outline" size="icon" aria-label="Go Back">
						<ArrowLeftIcon />
					</Button>
				</ButtonGroup>
				<ButtonGroup>
					<Button variant="outline">Archive</Button>
					<Button variant="outline">Report</Button>
				</ButtonGroup>
				<ButtonGroup>
					<Button variant="outline">Snooze</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon" aria-label="More Options">
								<MoreHorizontalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40">
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<MailCheckIcon />
									Mark as Read
								</DropdownMenuItem>
								<DropdownMenuItem>
									<ArchiveIcon />
									Archive
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<ClockIcon />
									Snooze
								</DropdownMenuItem>
								<DropdownMenuItem>
									<CalendarPlusIcon />
									Add to Calendar
								</DropdownMenuItem>
								<DropdownMenuItem>
									<ListFilterIcon />
									Add to List
								</DropdownMenuItem>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<TagIcon />
										Label As...
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuRadioGroup value={label} onValueChange={setLabel}>
											<DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="work">Work</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem className="text-destructive">
									<Trash2Icon />
									Trash
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</ButtonGroup>
			</ButtonGroup>
		);
	},
};
