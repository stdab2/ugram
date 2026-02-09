import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateUsersExist } from "../../Validators/validateUsersExist";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export const postResolvers = {
  Query: {
    post: async (_: any, args: { id: number }) => {
      return prisma.post.findUnique({
        where: { id: args.id },
      });
    },
    posts: async (_: any, args: { limit?: number; offset?: number }) => {
      return prisma.post.findMany({
        take: args.limit,
        skip: args.offset,
      });
    },
    postsByAuthor: async (_: any, args: { authorId: number; limit?: number; offset?: number }) => {
      return prisma.post.findMany({
        where: { authorId: args.authorId },
        take: args.limit,
        skip: args.offset,
      });
    },
  },
  Post: {
    author: async (parent: any) => {
      return prisma.userUgram.findUnique({
        where: { id: parent.authorId },
      });
    },
  },
  Mutation: {
  createPost: async (_: any, { data }: any) => {
    const { description, imageUrl, authorId, hashtags, mentionedUsers } = data;
    
    if (mentionedUsers && mentionedUsers.length > 0) {
      await validateUsersExist(mentionedUsers);
    }

    const tags  = hashtags.map((t: string) => t.toLowerCase())
    
    try {

    if (tags.length) {
      await prisma.hashtag.createMany({
        data: tags.map((name: string) => ({ name })),
        skipDuplicates: true,
      });
    }
    
    const hashtagRows:{id: number}[] = tags.length
    ? await prisma.hashtag.findMany({
      where: { name: { in: tags } },
      select: { id: true },
    })
    : [];    

   
    const post = await prisma.post.create({
      data: {
        description,
        imageUrl,
        authorId,
        hashtags: {
          connect: hashtagRows.map((h) => ({ id: h.id })),
        },
        mentionedUsers: {
          connect: mentionedUsers.map((id: number) => ({ id })),
        },        
      },
       include: {
      hashtags: true,
      mentionedUsers: true,
      author: true,
      },
    });

    return post;
    } catch (e) {
      throw e;
}
  },
}
};
