export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			["feat", "fix", "docs", "style", "refactor", "test", "chore", "revert"],
		],
		"scope-enum": [
			2,
			"always",
			[
				// Features
				"auth",
				"images",
				"feed",
				"profile",
				"search",
				"notifications",
				// Technical
				"api",
				"db",
				"ui",
				"config",
				"deps",
				"ci",
				"docker",
				// Documentation
				"readme",
				"docs",
			],
		],
		"scope-case": [2, "always", "kebab-case"],
		"subject-case": [2, "always", "lower-case"],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 72],
	},
};
