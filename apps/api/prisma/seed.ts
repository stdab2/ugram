import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { getDatabaseUrl } from "../database-url.js";

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

const userData: Prisma.UserUgramCreateInput[] = [
	{
		userName: "john_doe",
		password: "qwerty",
		email: "john.doe@example.com",
		phoneNumber: "+15145550001",
		firstName: "John",
		lastName: "Doe",
		picture: "uploads/profile/1.jpg",
		posts: {
			create: [
				{
					description: "Beautiful sunset at the beach 🌅 #sunset #beach #photography",
					imageUrl: "uploads/post/1.jpg",
					hashtags: {
						connect: [{ name: "#sunset" }, { name: "#beach" }, { name: "#photography" }],
					},
				},
				{
					description: "New adventure begins! #travel #adventure",
					imageUrl: "uploads/post/6.jpg",
					hashtags: {
						connect: [{ name: "#travel" }, { name: "#adventure" }],
					},
				},
				{
					description: "Good vibes only ✨ #lifestyle #mood",
					imageUrl: "uploads/post/7.jpg",
					hashtags: {
						connect: [{ name: "#lifestyle" }, { name: "#mood" }],
					},
				},
				{
					description: "Throwback to summer days 🌞 #summer #memories",
					imageUrl: "uploads/post/8.jpg",
					hashtags: {
						connect: [{ name: "#summer" }, { name: "#memories" }],
					},
				},
			],
		},
	},

	{
		userName: "jane_smith",
		password: "qwerty",
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
					imageUrl: "uploads/post/2.jpg",
					hashtags: {
						connect: [{ name: "#coffee" }, { name: "#morning" }, { name: "#lifestyle" }],
					},
					mentionedUsers: {
						connect: [{ email: "john.doe@example.com" }],
					},
				},
			],
		},
	},

	{
		userName: "travel_explorer",
		password: "qwerty",
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
					imageUrl: "uploads/post/3.jpg",
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
				},
			],
		},
	},

	{
		userName: "foodie_lover",
		password: "qwerty",
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
					imageUrl: "uploads/post/4.jpg",
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
				},
			],
		},
	},

	{
		userName: "urban_photographer",
		password: "qwerty",
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
					imageUrl: "uploads/post/5.jpg",
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
		await prisma.userUgram.upsert({
			where: { email: uData.email },
			update: {},
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
