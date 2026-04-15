import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcrypt";
import { getDatabaseUrl } from "../src/database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

const hashtags: Prisma.HashtagCreateInput[] = [
	{ name: "#sunset" },
	{ name: "#beach" },
	{ name: "#photography" },
	{ name: "#travel" },
	{ name: "#adventure" },
	{ name: "#lifestyle" },
	{ name: "#mood" },
	{ name: "#summer" },
	{ name: "#memories" },
	{ name: "#coffee" },
	{ name: "#morning" },
	{ name: "#mountains" },
	{ name: "#hiking" },
	{ name: "#food" },
	{ name: "#cooking" },
	{ name: "#pasta" },
	{ name: "#italian" },
	{ name: "#citylife" },
	{ name: "#urban" },
	{ name: "#nightphotography" },
];

const encryptedPassword = await bcrypt.hash("qwerty", 10);

const userData: Prisma.UserUgramCreateInput[] = [
	{
		userName: "john_doe",
		password: encryptedPassword,
		email: "john.doe@example.com",
		phoneNumber: "+15145550001",
		firstName: "John",
		lastName: "Doe",
		picture: "uploads/profile/1.jpg",
		posts: {
			create: [
				{
					description: "Beautiful sunset at the beach 🌅 #sunset #beach #photography",
					imageUrl: "uploads/post/1.webp",
					thumbnailUrl: "uploads/post/1_thumb.webp",
					hashtags: {
						connect: [{ name: "#sunset" }, { name: "#beach" }, { name: "#photography" }],
					},
					imageKey: "1",
					imageStatus: "PENDING",
				},
				{
					description: "New adventure begins! #travel #adventure",
					imageUrl: "uploads/post/6.webp",
					thumbnailUrl: "uploads/post/6_thumb.webp",
					hashtags: {
						connect: [{ name: "#travel" }, { name: "#adventure" }],
					},
					imageKey: "6",
					imageStatus: "PENDING",
				},
				{
					description: "Good vibes only ✨ #lifestyle #mood",
					imageUrl: "uploads/post/7.webp",
					thumbnailUrl: "uploads/post/7_thumb.webp",
					hashtags: {
						connect: [{ name: "#lifestyle" }, { name: "#mood" }],
					},
					imageKey: "7",
					imageStatus: "UPLOADED",
				},
				{
					description: "Throwback to summer days 🌞 #summer #memories",
					imageUrl: "uploads/post/8.webp",
					thumbnailUrl: "uploads/post/8_thumb.webp",
					hashtags: {
						connect: [{ name: "#summer" }, { name: "#memories" }],
					},
					imageKey: "8",
					imageStatus: "UPLOADED",
				},
			],
		},
	},

	{
		userName: "jane_smith",
		password: encryptedPassword,
		email: "jane.smith@example.com",
		phoneNumber: "+15145550002",
		firstName: "Jane",
		lastName: "Smith",
		picture: "uploads/profile/2.jpg",
		posts: {
			create: [
				{
					description:
						"Morning coffee vibes ☕️ Thanks @john_doe for the recommendation! #coffee #morning #lifestyle",
					imageUrl: "uploads/post/2.webp",
					thumbnailUrl: "uploads/post/2_thumb.webp",
					hashtags: {
						connect: [{ name: "#coffee" }, { name: "#morning" }, { name: "#lifestyle" }],
					},
					mentionedUsers: {
						connect: [{ email: "john.doe@example.com" }],
					},
					imageKey: "2",
					imageStatus: "UPLOADED",
				},
			],
		},
	},

	{
		userName: "travel_explorer",
		password: encryptedPassword,
		email: "travel.explorer@example.com",
		phoneNumber: "+15145550003",
		firstName: "John",
		lastName: "Doe",
		picture: "uploads/profile/3.jpg",
		posts: {
			create: [
				{
					description:
						"Mountain views from the top 🏔️ Amazing hiking experience with @john_doe #travel #mountains #adventure #hiking",
					imageUrl: "uploads/post/3.webp",
					thumbnailUrl: "uploads/post/3_thumb.webp",
					hashtags: {
						connect: [
							{ name: "#travel" },
							{ name: "#mountains" },
							{ name: "#adventure" },
							{ name: "#hiking" },
						],
					},
					mentionedUsers: {
						connect: [{ email: "john.doe@example.com" }],
					},
					imageKey: "3",
					imageStatus: "UPLOADED",
				},
			],
		},
	},

	{
		userName: "foodie_lover",
		password: encryptedPassword,
		email: "foodie.lover@example.com",
		phoneNumber: "+15145550004",
		firstName: "Maria",
		lastName: "Garcia",
		picture: "uploads/profile/4.jpg",
		posts: {
			create: [
				{
					description:
						"Homemade pasta night 🍝 Recipe in bio! Cooking with @john_doe and @jane_smith #food #cooking #pasta #italian",
					imageUrl: "uploads/post/4.webp",
					thumbnailUrl: "uploads/post/4_thumb.webp",
					hashtags: {
						connect: [
							{ name: "#food" },
							{ name: "#cooking" },
							{ name: "#pasta" },
							{ name: "#italian" },
						],
					},
					mentionedUsers: {
						connect: [{ email: "john.doe@example.com" }, { email: "jane.smith@example.com" }],
					},
					imageKey: "4",
					imageStatus: "UPLOADED",
				},
			],
		},
	},

	{
		userName: "urban_photographer",
		password: encryptedPassword,
		email: "urban.photographer@example.com",
		phoneNumber: "+15145550005",
		firstName: "John",
		lastName: "Doe",
		picture: "uploads/profile/5.jpg",
		posts: {
			create: [
				{
					description:
						"City lights and night vibes 🌃 Shot with @jane_smith #citylife #photography #urban #nightphotography",
					imageUrl: "uploads/post/5.webp",
					thumbnailUrl: "uploads/post/5_thumb.webp",
					hashtags: {
						connect: [
							{ name: "#citylife" },
							{ name: "#photography" },
							{ name: "#urban" },
							{ name: "#nightphotography" },
						],
					},
					mentionedUsers: {
						connect: [{ email: "jane.smith@example.com" }],
					},
					imageKey: "5",
					imageStatus: "UPLOADED",
				},
			],
		},
	},
];

async function main() {
	for (const hashtag of hashtags) {
		await prisma.hashtag.upsert({
			where: { name: hashtag.name },
			update: {},
			create: hashtag,
		});
	}
	for (const uData of userData) {
		const { userName, password, phoneNumber, firstName, lastName, picture, email } = uData;
		await prisma.userUgram.upsert({
			where: { email },
			update: {
				userName,
				password,
				phoneNumber,
				firstName,
				lastName,
				picture,
			},
			create: uData,
		});
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("Error seeding database:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
