<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { onMount, tick, type Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import ContentSidebar from '$lib/components/content/ContentSidebar.svelte';
	import MobileSidebar from '$lib/components/content/MobileSidebar.svelte';
	import ScrollArea from '$lib/components/ui/ScrollArea.svelte';
	import { type SectionUiConfig } from '$lib/config/content-ui';
	import type { ContentItem, ContentSectionLink } from '$lib/config/navigation';

	type SidebarConfig = {
		navigation: ContentItem[];
		navigationLabel: string;
		basePath: string;
		showSearch?: boolean;
		showThemeToggle?: boolean;
		showRepositoryLink?: boolean;
		repositoryUrl?: string;
		repositoryAriaLabel?: string;
		searchConfig?: SectionUiConfig['search'];
		sectionLinks?: ContentSectionLink[];
	};

	const DEFAULT_GRID_CLASS_BASE =
		'flex size-full min-w-0 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-4 lg:p-4 xl:justify-center';
	const DEFAULT_GRID_CLASS_WITH_ASIDE = 'xl:grid-cols-[20rem_minmax(0,56rem)_16rem]';
	const DEFAULT_CONTENT_WRAPPER_CLASS_BASE =
		'inset-shadow relative mx-auto h-full w-full min-w-0 overflow-hidden border border-border bg-background-inset pt-12 lg:max-h-[calc(100dvh-2rem)] lg:overflow-visible lg:rounded-xl lg:pt-0';
	const DEFAULT_CONTENT_WRAPPER_CLASS_WITH_ASIDE = 'max-w-4xl';
	const DEFAULT_SCROLL_AREA_CLASS_BASE = 'mx-auto size-full lg:max-h-[calc(100dvh-2rem)]';
	const DEFAULT_SCROLL_AREA_CLASS_NO_ASIDE = 'flex min-w-0';
	const DEFAULT_SCROLL_VIEWPORT_CLASS_BASE = 'lg:rounded-xl overscroll-none flex flex-col';
	const DEFAULT_SCROLL_VIEWPORT_CLASS_PADDED = 'gap-8 px-4 py-8 lg:px-8';
	const DEFAULT_SCROLL_VIEWPORT_CLASS_COMPACT = 'h-full gap-6';
	const DEFAULT_SCROLL_VIEWPORT_STYLE =
		'mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent);';

	const {
		mainId,
		scrollContainerId,
		gridClass,
		contentWrapperClass,
		scrollAreaClass,
		scrollViewportClass,
		scrollViewportStyle,
		// feature flags
		showAside = true,
		innerViewportStyle = true,
		sidebarConfig,
		main,
		aside
	}: {
		mainId: string;
		scrollContainerId: string;
		gridClass?: string;
		contentWrapperClass?: string;
		scrollAreaClass?: string;
		scrollViewportClass?: string;
		scrollViewportStyle?: string;
		showAside?: boolean;
		innerViewportStyle?: boolean;
		sidebarConfig: SidebarConfig;
		main: Snippet;
		aside?: Snippet;
	} = $props();

	const resolvedShowAside = $derived(showAside && Boolean(aside));
	const resolvedGridClass = $derived(
		gridClass ??
			[DEFAULT_GRID_CLASS_BASE, resolvedShowAside ? DEFAULT_GRID_CLASS_WITH_ASIDE : null]
				.filter(Boolean)
				.join(' ')
	);
	const resolvedContentWrapperClass = $derived(
		contentWrapperClass ??
			[
				DEFAULT_CONTENT_WRAPPER_CLASS_BASE,
				resolvedShowAside ? DEFAULT_CONTENT_WRAPPER_CLASS_WITH_ASIDE : null
			]
				.filter(Boolean)
				.join(' ')
	);
	const resolvedScrollAreaClass = $derived(
		scrollAreaClass ??
			[
				DEFAULT_SCROLL_AREA_CLASS_BASE,
				resolvedShowAside ? null : DEFAULT_SCROLL_AREA_CLASS_NO_ASIDE
			]
				.filter(Boolean)
				.join(' ')
	);
	const resolvedScrollViewportClass = $derived(
		scrollViewportClass ??
			[
				DEFAULT_SCROLL_VIEWPORT_CLASS_BASE,
				innerViewportStyle
					? DEFAULT_SCROLL_VIEWPORT_CLASS_PADDED
					: DEFAULT_SCROLL_VIEWPORT_CLASS_COMPACT
			]
				.filter(Boolean)
				.join(' ')
	);
	const resolvedScrollViewportStyle = $derived(
		scrollViewportStyle ?? (innerViewportStyle ? DEFAULT_SCROLL_VIEWPORT_STYLE : undefined)
	);

	const navigation = $derived(sidebarConfig.navigation);
	const navigationLabel = $derived(sidebarConfig.navigationLabel);
	const basePath = $derived(sidebarConfig.basePath);
	const showSearch = $derived(sidebarConfig.showSearch);
	const showThemeToggle = $derived(sidebarConfig.showThemeToggle);
	const showRepositoryLink = $derived(sidebarConfig.showRepositoryLink);
	const repositoryUrl = $derived(sidebarConfig.repositoryUrl);
	const repositoryAriaLabel = $derived(sidebarConfig.repositoryAriaLabel);
	const searchConfig = $derived(sidebarConfig.searchConfig);
	const sectionLinks = $derived(sidebarConfig.sectionLinks ?? []);

	const scrollPositions = new SvelteMap<string, number>();
	let hashFallbackTimer: ReturnType<typeof setTimeout> | null = null;

	function clearHashFallbackTimer() {
		if (hashFallbackTimer) {
			clearTimeout(hashFallbackTimer);
			hashFallbackTimer = null;
		}
	}

	async function scrollToHash(hash: string) {
		if (!hash) return;
		const id = hash.substring(1);

		const scrollToElement = () => {
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
				return true;
			}
			return false;
		};

		clearHashFallbackTimer();
		await tick().then(() => {
			if (!scrollToElement()) {
				hashFallbackTimer = setTimeout(scrollToElement, 100);
			}
		});
	}

	beforeNavigate(() => {
		const elem = document.getElementById(scrollContainerId);
		if (elem) {
			scrollPositions.set(page.url.pathname, elem.scrollTop);
		}
	});

	afterNavigate((nav) => {
		const elem = document.getElementById(scrollContainerId);
		if (elem && !page.url.hash) {
			if (nav.type === 'popstate') {
				const saved = scrollPositions.get(page.url.pathname);
				if (saved !== undefined) {
					elem.scrollTop = saved;
				}
			} else {
				elem.scrollTop = 0;
			}
		}

		if (page.url.hash) {
			void scrollToHash(page.url.hash);
		}
	});

	onMount(() => {
		const handleHashChange = () => {
			void scrollToHash(window.location.hash);
		};

		window.addEventListener('hashchange', handleHashChange);
		handleHashChange();

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
			clearHashFallbackTimer();
		};
	});
</script>

<a
	href={`#${mainId}`}
	class="sr-only fixed top-3 left-3 z-100 bg-foreground px-4 py-2 text-sm text-background-inset focus:not-sr-only"
>
	Skip to main content
</a>

<main id={mainId} tabindex="-1" class="relative h-dvh bg-background text-foreground">
	<MobileSidebar
		{navigation}
		{navigationLabel}
		{basePath}
		{showSearch}
		{showThemeToggle}
		{showRepositoryLink}
		{repositoryUrl}
		{repositoryAriaLabel}
		{searchConfig}
		{sectionLinks}
	/>

	<div class={resolvedGridClass}>
		<div class="hidden lg:block">
			<ContentSidebar
				{navigation}
				{navigationLabel}
				{basePath}
				{showSearch}
				{showThemeToggle}
				{showRepositoryLink}
				{repositoryUrl}
				{repositoryAriaLabel}
				{searchConfig}
				{sectionLinks}
			/>
		</div>

		<div class={resolvedContentWrapperClass}>
			<ScrollArea
				mode="vertical"
				id={scrollContainerId}
				class={resolvedScrollAreaClass}
				viewportClass={resolvedScrollViewportClass}
				viewportStyle={resolvedScrollViewportStyle}
			>
				{@render main()}
			</ScrollArea>
		</div>

		{#if aside && resolvedShowAside}
			{@render aside()}
		{/if}
	</div>
</main>
