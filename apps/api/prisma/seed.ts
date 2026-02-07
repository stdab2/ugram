import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

const hashtags: Prisma.HashtagCreateInput[] = [
	{ name: "#firstpost" },
	{ name: "#summer" },
	{ name: "#ugram" },
];

const userData: Prisma.UserUgramCreateInput[] = [
	{
		userName: "jane_doe",
		password: "ytrewq",
		email: "jane.doe@example.com",
		phoneNumber: "+15145551111",
		firstName: "Jane",
		lastName: "Doe",
		picture: "images/profile/jane_doe.png",
		posts: {
			create: [
				{
					description: "My first post on Ugram",
					imageLink: "images/post/post_1.png",
					hashtags: {
						connect: [{ name: "#ugram" }],
					},
				},
			],
		},
	},
	{
		userName: "john_doe",
		password: "qwerty",
		email: "john.doe@example.com",
		phoneNumber: "+15145550000",
		firstName: "John",
		lastName: "Doe",
		picture: "images/profile/john_doe.png",
		posts: {
			create: [
				{
					description: "My first post on Ugram",
					imageLink: "images/post/post_2.png",
					mentionedUsers: {
						connect: [{ email: "jane.doe@example.com" }],
					},
					hashtags: {
						connect: [{ name: "#firstpost" }, { name: "#summer" }],
					},
				},
				{
					description: "My second post on Ugram",
					imageLink: "images/post/post_3.png",
					mentionedUsers: {
						connect: [{ email: "jane.doe@example.com" }],
					},
					hashtags: {
						connect: [{ name: "#ugram" }],
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
