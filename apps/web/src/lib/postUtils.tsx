import { Link } from "react-router-dom";

export function formatDescription(text?: string) {
	if (!text) return { description: null, hashtags: [] };

	// Extract hashtags
	const hashtagMatches = text.match(/#\w+/g) || [];

	// Remove hashtags from description
	const descriptionWithoutHashtags = text.replace(/#\w+/g, "").trim();

	// Format description with mentions
	const parts = descriptionWithoutHashtags.split(/(@\w+)/g);
	const formattedDescription = parts.map((part, index) => {
		if (part.startsWith("@")) {
			const username = part.slice(1);
			return (
				<Link
					key={index}
					to={`/profile/${username}`}
					className="text-indigo-400 font-medium hover:underline"
				>
					{part}
				</Link>
			);
		}
		return <span key={index}>{part}</span>;
	});

	return { description: formattedDescription, hashtags: hashtagMatches };
}

export function formatDate(dateString: string | unknown) {
	const date = new Date(dateString as string);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return `${diffInSeconds}s`;
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
	return date.toLocaleDateString();
}
