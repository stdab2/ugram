import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

const MIN_QUERY_LENGTH = 2;
const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 8;
const USER_RATIO = 0.375;
const HASHTAG_RATIO = 0.375;
const FETCH_MULTIPLIER = 3;

interface AutocompleteArgs {
	query: string;
	limit?: number;
}

function isBoundaryChar(value: string | undefined) {
	return !value || /[\s.,!?;:/\\()[\]{}"'_-]/.test(value);
}

function getMatchPriority(value: string, query: string) {
	const normalizedValue = value.toLowerCase();
	const normalizedQuery = query.toLowerCase();
	const matchIndex = normalizedValue.indexOf(normalizedQuery);

	if (matchIndex === -1) {
		return Number.MAX_SAFE_INTEGER;
	}

	if (matchIndex === 0) {
		return 0;
	}

	if (isBoundaryChar(value[matchIndex - 1])) {
		return 1;
	}

	return 2;
}

function compareByRelevance<T>(
	left: T,
	right: T,
	query: string,
	getSearchValue: (item: T) => string,
	priorityOffset = 0
) {
	const leftValue = getSearchValue(left);
	const rightValue = getSearchValue(right);
	const leftPriority = getMatchPriority(leftValue, query) + priorityOffset;
	const rightPriority = getMatchPriority(rightValue, query) + priorityOffset;
	const normalizedQuery = query.toLowerCase();
	const leftMatchIndex = leftValue.toLowerCase().indexOf(normalizedQuery);
	const rightMatchIndex = rightValue.toLowerCase().indexOf(normalizedQuery);

	return (
		leftPriority - rightPriority ||
		leftMatchIndex - rightMatchIndex ||
		leftValue.length - rightValue.length
	);
}

export const autocompleteResolvers = {
	Query: {
		searchAutocomplete: async (_: unknown, args: AutocompleteArgs) => {
			const query = args.query.trim();

			if (query.length < MIN_QUERY_LENGTH) {
				return { users: [], posts: [], hashtags: [] };
			}

			const total = Math.min(Math.max(args.limit ?? DEFAULT_LIMIT, 0), MAX_LIMIT);
			const userLimit = Math.ceil(total * USER_RATIO);
			const hashtagLimit = Math.ceil(total * HASHTAG_RATIO);
			const postLimit = Math.max(total - userLimit - hashtagLimit, 1);
			const fetchLimit = Math.min(total * FETCH_MULTIPLIER, MAX_LIMIT);
			const hashtagSearchTerm = query.startsWith("#") ? query : `#${query}`;

			const [users, posts, hashtags] = await Promise.all([
				prisma.userUgram.findMany({
					where: {
						OR: [
							{ userName: { contains: query, mode: "insensitive" } },
							{ firstName: { contains: query, mode: "insensitive" } },
							{ lastName: { contains: query, mode: "insensitive" } },
						],
					},
					select: {
						id: true,
						userName: true,
						firstName: true,
						lastName: true,
						picture: true,
					},
					take: fetchLimit,
				}),
				prisma.post.findMany({
					where: {
						description: { contains: query, mode: "insensitive" },
					},
					select: {
						id: true,
						description: true,
						imageUrl: true,
					},
					take: fetchLimit,
					orderBy: { createdAt: "desc" },
				}),
				prisma.hashtag.findMany({
					where: {
						OR: [
							{ name: { contains: query, mode: "insensitive" } },
							{ name: { contains: hashtagSearchTerm, mode: "insensitive" } },
						],
					},
					include: {
						_count: {
							select: { posts: true },
						},
					},
					take: fetchLimit,
				}),
			]);

			const rankedUsers = users
				.sort((left, right) => {
					const byUserName = compareByRelevance(left, right, query, (item) => item.userName);

					if (byUserName !== 0) {
						return byUserName;
					}

					return compareByRelevance(
						left,
						right,
						query,
						(item) => `${item.firstName} ${item.lastName}`.trim(),
						1
					);
				})
				.slice(0, userLimit);

			const rankedPosts = posts
				.sort((left, right) =>
					compareByRelevance(left, right, query, (item) => item.description, 1)
				)
				.slice(0, postLimit);

			const rankedHashtags = hashtags
				.sort((left, right) => {
					const byName = compareByRelevance(left, right, query, (item) => item.name, -1);

					if (byName !== 0) {
						return byName;
					}

					return right._count.posts - left._count.posts;
				})
				.slice(0, hashtagLimit)
				.map((hashtag) => ({
					id: hashtag.id,
					name: hashtag.name,
					postCount: hashtag._count.posts,
				}));

			return { users: rankedUsers, posts: rankedPosts, hashtags: rankedHashtags };
		},
	},
};
