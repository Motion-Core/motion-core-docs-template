export type DocsConfig = {
	categoryOrder?: string[];
	defaults?: {
		category?: string;
		rootCategory?: string;
		rootName?: string;
		rootOrder?: number;
		defaultOrder?: number;
	};
	overrides?: Record<
		string,
		{
			name?: string;
			category?: string;
			order?: number;
			hidden?: boolean;
		}
	>;
};

export const docsConfig = {
	categoryOrder: ['Reference', 'Documentation'],
	defaults: {
		category: 'Reference',
		rootCategory: 'Reference',
		rootName: 'Overview',
		rootOrder: -1000,
		defaultOrder: 1000
	}
} satisfies DocsConfig;
