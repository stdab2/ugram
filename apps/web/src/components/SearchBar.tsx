import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutocompleteUserItem {
	id: number;
	userName: string;
	firstName: string;
	lastName: string;
	picture?: string | null;
}

interface AutocompletePostItem {
	id: number;
	description: string;
	imageUrl: string;
}

interface AutocompleteHashtagItem {
	id: number;
	name: string;
	postCount: number;
}

export interface SearchBarSuggestions {
	users: AutocompleteUserItem[];
	posts: AutocompletePostItem[];
	hashtags: AutocompleteHashtagItem[];
}

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
	placeholder?: string;
	className?: string;
	/** Optional autocomplete suggestions used to derive inline completion */
	suggestions?: SearchBarSuggestions;
	/** Called when the user accepts a suggestion (after the input value is updated) */
	onSuggestionSelect?: (value: string) => void;
}

interface CompletionCandidate {
	text: string;
	priority: number;
	matchIndex: number;
	lengthBias: number;
}

const COMPLETION_WORD_LIMIT = 4;
const COMPLETION_CHAR_LIMIT = 72;
const DESCRIPTION_COMPLETION_WORD_LIMIT = 1;

function isBoundaryChar(value: string | undefined) {
	return !value || /[\s.,!?;:/\\()[\]{}"'_#-]/.test(value);
}

function buildCompletionText(sourceText: string, query: string, wordLimit = COMPLETION_WORD_LIMIT) {
	const normalizedQuery = query.toLowerCase();
	const normalizedSource = sourceText.toLowerCase();
	let matchIndex = normalizedSource.indexOf(normalizedQuery);

	if (matchIndex === -1) {
		return null;
	}

	while (matchIndex !== -1 && matchIndex > 0 && !isBoundaryChar(sourceText[matchIndex - 1])) {
		matchIndex = normalizedSource.indexOf(normalizedQuery, matchIndex + 1);
	}

	if (matchIndex === -1) {
		return null;
	}

	const shouldSkipQuery = query.endsWith(" ");
	const startSlice = shouldSkipQuery ? matchIndex + query.length : matchIndex;
	const segment = sourceText.slice(startSlice).replace(/\s+/g, " ").trim();

	if (!segment) {
		return null;
	}

	const limitedWords = segment.split(" ").slice(0, wordLimit).join(" ");
	const limitedSegment =
		limitedWords.length > COMPLETION_CHAR_LIMIT
			? limitedWords.slice(0, COMPLETION_CHAR_LIMIT).trimEnd()
			: limitedWords;
	const text = shouldSkipQuery ? query + limitedSegment : limitedSegment;
	const priority = matchIndex === 0 ? 0 : isBoundaryChar(sourceText[matchIndex - 1]) ? 1 : 2;
	const lengthBias = Math.abs(text.length - query.length);

	return { text, priority, matchIndex, lengthBias };
}

function getBestCompletion(query: string, suggestions?: SearchBarSuggestions) {
	const trimmedQuery = query.trim();
	const hasTrailingSpace = query.endsWith(" ");

	if (!suggestions || trimmedQuery.length < 2) {
		return null;
	}

	const candidates: CompletionCandidate[] = [];

	for (const user of suggestions.users) {
		const userNameCandidate = buildCompletionText(user.userName, trimmedQuery);

		if (userNameCandidate) {
			candidates.push(userNameCandidate);
		}

		const fullName = `${user.firstName} ${user.lastName}`.trim();
		const fullNameCandidate = buildCompletionText(fullName, trimmedQuery);

		if (fullNameCandidate) {
			candidates.push({
				...fullNameCandidate,
				priority: fullNameCandidate.priority + 1,
			});
		}
	}

	for (const hashtag of suggestions.hashtags) {
		const hashtagCandidate = buildCompletionText(hashtag.name, trimmedQuery);

		if (hashtagCandidate) {
			candidates.push({
				...hashtagCandidate,
				priority: hashtagCandidate.priority - 1,
			});
		}
	}

	for (const post of suggestions.posts) {
		const postCandidate = buildCompletionText(
			post.description,
			hasTrailingSpace ? query : trimmedQuery,
			DESCRIPTION_COMPLETION_WORD_LIMIT
		);

		if (postCandidate) {
			candidates.push({
				...postCandidate,
				priority: postCandidate.priority + (hasTrailingSpace ? 2 : 3),
			});
		}
	}

	return candidates
		.filter((candidate) => candidate.text.toLowerCase() !== trimmedQuery.toLowerCase())
		.sort(
			(left, right) =>
				left.text.length - right.text.length ||
				left.priority - right.priority ||
				left.matchIndex - right.matchIndex ||
				left.lengthBias - right.lengthBias
		)
		.at(0);
}

export function SearchBar({
	value,
	onChange,
	onClear,
	placeholder = "Search",
	className,
	suggestions,
	onSuggestionSelect,
}: SearchBarProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [dismissedValue, setDismissedValue] = useState<string | null>(null);

	const completion = getBestCompletion(value, suggestions);
	const completionText = dismissedValue === value ? null : (completion?.text ?? null);
	const completionSuffix =
		completionText && completionText.toLowerCase().startsWith(value.toLowerCase())
			? completionText.slice(value.length)
			: null;
	const showInlineCompletion = isFocused && !!completionSuffix;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Tab" && completionText) {
			e.preventDefault();
			onChange(completionText);
			onSuggestionSelect?.(completionText);
			setDismissedValue(null);
		} else if (e.key === "Escape") {
			setDismissedValue(value);
		}
	};

	return (
		<div className={cn("relative", className)}>
			<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
			{showInlineCompletion && (
				<div className="pointer-events-none absolute inset-0 z-30 flex items-center overflow-hidden pl-12 pr-12 text-base md:text-sm font-[inherit] tracking-[inherit] leading-[inherit] translate-y-[1px]">
					<span className="invisible whitespace-pre">{value}</span>
					<span className="whitespace-pre text-muted-foreground/70">{completionSuffix}</span>
				</div>
			)}
			<Input
				type="text"
				role="searchbox"
				aria-autocomplete="inline"
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setDismissedValue(null);
				}}
				onFocus={() => {
					setIsFocused(true);
					setDismissedValue(null);
				}}
				onBlur={() => setIsFocused(false)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className="relative z-20 pl-12 pr-12 h-12 text-base bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl"
			/>
			{value && (
				<button
					type="button"
					onClick={() => {
						onClear();
						setDismissedValue(null);
					}}
					aria-label="Clear search"
					className="absolute right-4 top-1/2 z-30 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<X className="w-5 h-5" />
				</button>
			)}
		</div>
	);
}
