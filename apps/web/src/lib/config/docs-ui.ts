export const availablePackageManagers = ['npm', 'pnpm', 'bun', 'yarn'] as const;
export type PackageManagerOption = (typeof availablePackageManagers)[number];

export type DocsUiConfig = {
	search: {
		enabled: boolean;
		triggerPlaceholder: string;
		dialogPlaceholder: string;
		noResultsLabel: string;
		submitHintLabel: string;
		hotkey: {
			enabled: boolean;
			key: string;
			metaOrCtrl: boolean;
			label: string;
		};
		maxGroups: number;
		maxChildrenPerGroup: number;
	};
	sidebar: {
		navigationLabel: string;
		showThemeToggle: boolean;
		showRepositoryLink: boolean;
		repositoryAriaLabel: string;
	};
	toc: {
		enabled: boolean;
		title: string;
		emptyLabel: string;
		minViewportWidth: number;
		defaultSelector: string;
		selectorOverrides: Array<{
			slugPrefix: string;
			selector: string;
		}>;
	};
	docActions: {
		enabled: boolean;
		showCopyMarkdown: boolean;
		showRepositoryLink: boolean;
		repositoryLinkLabel: string;
		repositoryBranch: string;
		moreActionsAriaLabel: string;
		copyLabels: {
			desktopIdle: string;
			mobileIdle: string;
			copying: string;
			success: string;
			error: string;
		};
		assistantPromptTemplate: string;
		assistants: {
			chatgpt: {
				enabled: boolean;
				label: string;
				hrefTemplate: string;
			};
			claude: {
				enabled: boolean;
				label: string;
				hrefTemplate: string;
			};
		};
	};
	pagination: {
		enabled: boolean;
		previousLabel: string;
		nextLabel: string;
	};
	packageManager: {
		enabled: PackageManagerOption[];
		default: PackageManagerOption;
		storageKey: string;
	};
	theme: {
		storageKey: string;
		defaultMode: 'light' | 'dark' | 'system';
	};
};

export const docsUiConfig: DocsUiConfig = {
	search: {
		enabled: true,
		triggerPlaceholder: 'Search...',
		dialogPlaceholder: 'Search documentation...',
		noResultsLabel: 'No results found.',
		submitHintLabel: 'Go to page',
		hotkey: {
			enabled: true,
			key: 'k',
			metaOrCtrl: true,
			label: '⌘K'
		},
		maxGroups: 20,
		maxChildrenPerGroup: 5
	},
	sidebar: {
		navigationLabel: 'Docs',
		showThemeToggle: true,
		showRepositoryLink: true,
		repositoryAriaLabel: 'Open project repository'
	},
	toc: {
		enabled: true,
		title: 'On this page',
		emptyLabel: 'No headings',
		minViewportWidth: 1280,
		defaultSelector: '[data-doc-content] h2, [data-doc-content] h3',
		selectorOverrides: [{ slugPrefix: 'changelog/', selector: '[data-doc-content] h2' }]
	},
	docActions: {
		enabled: true,
		showCopyMarkdown: true,
		showRepositoryLink: true,
		repositoryLinkLabel: 'Open in GitHub',
		repositoryBranch: 'master',
		moreActionsAriaLabel: 'More actions',
		copyLabels: {
			desktopIdle: 'Copy as Markdown',
			mobileIdle: 'Copy Markdown',
			copying: 'Copying…',
			success: 'Copied!',
			error: 'Copy failed'
		},
		assistantPromptTemplate:
			"I'm currently viewing the documentation at {url}. Please assist me in learning how to work with it. I may need clarification on concepts, sample code demonstrations, or troubleshooting guidance related to this documentation.",
		assistants: {
			claude: {
				enabled: true,
				label: 'Open in Claude',
				hrefTemplate: 'https://claude.ai/new?q={prompt}'
			}
		}
	},
	pagination: {
		enabled: true,
		previousLabel: 'Previous',
		nextLabel: 'Next'
	},
	packageManager: {
		enabled: ['npm', 'pnpm', 'bun', 'yarn'],
		default: 'npm',
		storageKey: 'docs-package-manager'
	},
	theme: {
		storageKey: 'docs-theme',
		defaultMode: 'system'
	}
};

function interpolateTemplate(template: string, variables: Record<string, string>) {
	return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => variables[key] ?? '');
}

export function resolveTocSelector(slug?: string | null) {
	const normalizedSlug = slug ?? '';
	const override = docsUiConfig.toc.selectorOverrides.find((item) =>
		normalizedSlug.startsWith(item.slugPrefix)
	);
	return override?.selector ?? docsUiConfig.toc.defaultSelector;
}

export function resolveDocAssistantUrls(rawUrl?: string | null) {
	if (!rawUrl) {
		return {
			chatGptUrl: null,
			claudeUrl: null
		};
	}

	const prompt = interpolateTemplate(docsUiConfig.docActions.assistantPromptTemplate, {
		url: rawUrl
	});
	const encodedPrompt = encodeURIComponent(prompt);
	const encodedUrl = encodeURIComponent(rawUrl);
	const templateVars = {
		prompt: encodedPrompt,
		url: rawUrl,
		encodedUrl
	};

	return {
		chatGptUrl: docsUiConfig.docActions.assistants.chatgpt.enabled
			? interpolateTemplate(docsUiConfig.docActions.assistants.chatgpt.hrefTemplate, templateVars)
			: null,
		claudeUrl: docsUiConfig.docActions.assistants.claude.enabled
			? interpolateTemplate(docsUiConfig.docActions.assistants.claude.hrefTemplate, templateVars)
			: null
	};
}

export function resolveRepositoryDocUrl(repositoryBaseUrl: string, repositoryRelativePath: string) {
	const branch = docsUiConfig.docActions.repositoryBranch.trim();
	const safeBranch = branch.length > 0 ? branch : 'main';
	return `${repositoryBaseUrl}/blob/${safeBranch}${repositoryRelativePath}`;
}
