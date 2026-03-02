import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

interface SearchArgs {
  query: string;
  limit?: number;
  offset?: number;
}

export const searchResolvers = {
  Query: {
    search: async (_: unknown, args: SearchArgs) => {
      const { query, limit = 20, offset = 0 } = args;
      const searchTerm = query.trim();

      if (!searchTerm) {
        return { users: [], posts: [], hashtags: [] };
      }

      // Déterminer si on cherche un hashtag
      const isHashtagSearch = searchTerm.startsWith("#");
      const hashtagName = isHashtagSearch ? searchTerm : `#${searchTerm}`;

      // Recherche d'utilisateurs par username, firstName ou lastName (partiel ou complet)
      const users = await prisma.userUgram.findMany({
        where: {
          OR: [
            { userName: { contains: searchTerm, mode: "insensitive" } },
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: limit,
        skip: offset,
      });

      // Recherche de posts
      let posts;
      
      if (isHashtagSearch) {
        // Si le terme commence par #, chercher uniquement par hashtag
        posts = await prisma.post.findMany({
          where: {
            hashtags: {
              some: {
                name: { equals: hashtagName, mode: "insensitive" },
              },
            },
          },
          include: {
            hashtags: true,
            mentionedUsers: true,
            author: true,
          },
          take: limit,
          skip: offset,
        });
      } else {
        // Sinon, chercher dans la description OU dans les hashtags
        posts = await prisma.post.findMany({
          where: {
            OR: [
              { description: { contains: searchTerm, mode: "insensitive" } },
              {
                hashtags: {
                  some: {
                    name: { contains: `#${searchTerm}`, mode: "insensitive" },
                  },
                },
              },
            ],
          },
          include: {
            hashtags: true,
            mentionedUsers: true,
            author: true,
          },
          take: limit,
          skip: offset,
        });
      }

      // Recherche de hashtags avec le nombre de posts
      const hashtags = await prisma.hashtag.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        include: {
          _count: {
            select: { posts: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          posts: {
            _count: 'desc', // Trier par popularité
          },
        },
      });

      // Transformer les hashtags pour inclure le postCount
      const hashtagsWithCount = hashtags.map((hashtag) => ({
        id: hashtag.id,
        name: hashtag.name,
        postCount: hashtag._count.posts,
      }));

      return { users, posts, hashtags: hashtagsWithCount };
    },
  },
};
