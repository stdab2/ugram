import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
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
					description: "Beautiful sunset at the beach 🌅 @jane_smith #sunset #beach #photography",
					imageUrl: "uploads/post/1.jpg",
				},
				{
					description: "New adventure begins! #travel #adventure",
					imageUrl: "uploads/post/6.jpg",
				},
				{
					description: "Good vibes only ✨ #lifestyle #mood",
					imageUrl: "uploads/post/7.jpg",
				},
				{
					description: "Throwback to summer days 🌞 #summer #memories",
					imageUrl: "uploads/post/8.jpg",
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
					description: "Morning coffee vibes ☕️ #coffee #morning #lifestyle",
					imageUrl: "uploads/post/2.jpg",
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
				},
			],
		},
	},
	{
		userName: "foodie_lover",
		password: "qwerty",
		email: "foodie.lover@example.com",
		phoneNumber: "+15145550004",
		firstName: "John",
		lastName: "Doe",
		picture: "uploads/profile/4.jpg",
		posts: {
			create: [
				{
					description: "Homemade pasta night 🍝 Recipe in bio! #food #cooking #pasta #italian",
					imageUrl: "uploads/post/4.jpg",
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
						"City lights and night vibes 🌃 #citylife #photography #urban #nightphotography",
					imageUrl: "uploads/post/5.jpg",
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
