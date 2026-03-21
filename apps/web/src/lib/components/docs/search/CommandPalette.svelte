<script lang="ts">
	import { searchState } from '$lib/stores/search.svelte';
	import { docsUiConfig } from '$lib/config/docs-ui';
	import { searchDocs } from '$lib/utils/search';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { onNavigate } from '$app/navigation';
	import { cn } from '$lib/utils/cn';
	import ScrollArea from '$lib/components/ui/ScrollArea.svelte';
	import { onMount, tick } from 'svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import Return from 'carbon-icons-svelte/lib/Return.svelte';

	let query = $state('');
	let results = $derived(searchDocs(query));
	let selectedIndex = $state(0);
	let normalizedSelectedIndex = $derived(
		results.length === 0 ? 0 : Math.min(selectedIndex, results.length - 1)
	);
	let contentHeight = $state(0);
	const canUseDocument = typeof document !== 'undefined';
	const dialogId = 'command-palette-dialog';
	const inputId = 'command-palette-input';

	function handleGlobalKeydown(e: KeyboardEvent) {
		const hotkey = docsUiConfig.search.hotkey;
		if (!hotkey.enabled || !docsUiConfig.search.enabled) {
			return;
		}

		const matchesModifier = hotkey.metaOrCtrl ? e.metaKey || e.ctrlKey : true;
		const matchesKey = e.key.toLowerCase() === hotkey.key.toLowerCase();
		if (matchesModifier && matchesKey) {
			e.preventDefault();
			searchState.toggle();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeydown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	function close() {
		searchState.close();
	}

	function getDialogElement() {
		if (!canUseDocument) return null;
		const node = document.getElementById(dialogId);
		return node instanceof HTMLDivElement ? node : null;
	}

	function getInputElement() {
		if (!canUseDocument) return null;
		const node = document.getElementById(inputId);
		return node instanceof HTMLInputElement ? node : null;
	}

	function manageDialogFocus(_node: HTMLDivElement) {
		const activeElement =
			canUseDocument && document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		const restoreFocusEl = activeElement instanceof HTMLElement ? activeElement : null;

		tick().then(() => {
			getInputElement()?.focus();
		});

		return () => {
			restoreFocusEl?.focus();
		};
	}

	function getFocusableElements() {
		const dialog = getDialogElement();
		if (!dialog) return [];
		const selector = 'a[href], button, input, textarea, select, [tabindex]';
		return Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(
			(element) =>
				!element.hasAttribute('disabled') &&
				element.getAttribute('aria-hidden') !== 'true' &&
				element.tabIndex >= 0
		);
	}

	function handleTabKey(event: KeyboardEvent) {
		const dialog = getDialogElement();
		if (!dialog) return;
		const focusable = getFocusableElements();
		if (focusable.length === 0) {
			event.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const activeElement =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;

		if (event.shiftKey) {
			if (!activeElement || activeElement === first || !dialog.contains(activeElement)) {
				event.preventDefault();
				last.focus();
			}
			return;
		}

		if (!activeElement || activeElement === last || !dialog.contains(activeElement)) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!searchState.isOpen) return;

		if (e.key === 'Tab') {
			handleTabKey(e);
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}

		if (results.length === 0) {
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % results.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + results.length) % results.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (results[normalizedSelectedIndex]) {
				selectResult(results[normalizedSelectedIndex]);
			}
		}
	}

	function selectResult(result: ReturnType<typeof searchDocs>[number]) {
		const href = `${result.slug}${result.anchor || ''}`;
		goto(href);
		close();
	}

	onNavigate(() => {
		close();
	});

	function highlight(text: string, search: string) {
		if (!search.trim()) return [{ text, highlight: false }];

		const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(${escapedSearch})`, 'gi');
		const parts = text.split(regex);

		return parts.map((part) => ({
			text: part,
			highlight: part.toLowerCase() === search.toLowerCase()
		}));
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if docsUiConfig.search.enabled && searchState.isOpen}
	<div
		class="fixed inset-0 z-60 bg-background-inset/80 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		onclick={close}
		role="presentation"
	></div>

	<div
		id={dialogId}
		{@attach manageDialogFocus}
		class="fixed inset-0 z-60 flex items-start justify-center p-4 sm:pt-[10vh]"
		role="dialog"
		aria-modal="true"
		aria-labelledby="command-palette-title"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && close()}
		onkeydown={(e) => e.key === 'Escape' && close()}
	>
		<div
			class="card relative w-full max-w-164 transform-gpu rounded-lg bg-background"
			role="document"
			transition:scale={{
				duration: 300,
				start: 0.95,
				easing: cubicOut
			}}
			onoutroend={() => {
				query = '';
				selectedIndex = 0;
				contentHeight = 0;
			}}
		>
			<span id="command-palette-title" class="sr-only">{docsUiConfig.search.dialogPlaceholder}</span
			>
			<div class="flex items-center border-b border-border/60 px-3">
				<Search size={24} class="mr-2 text-foreground-muted/70" />
				<input
					id={inputId}
					value={query}
					class="flex h-12 w-full bg-transparent text-base tracking-normal text-foreground placeholder:text-foreground-muted/70 focus:outline-none focus-visible:border-none! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:outline-none!"
					placeholder={docsUiConfig.search.dialogPlaceholder}
					aria-label={docsUiConfig.search.dialogPlaceholder}
					oninput={(event) => {
						query = (event.currentTarget as HTMLInputElement).value;
						selectedIndex = 0;
					}}
				/>
				<kbd
					class="pointer-events-none inset-shadow relative hidden h-5 items-center gap-1 rounded-[calc(var(--radius-base)*1.5)] bg-background-inset px-1.5 font-mono text-[10px] font-medium tracking-normal text-foreground-muted/70 select-none sm:flex"
				>
					ESC
				</kbd>
			</div>

			<div
				class="overflow-hidden transition-[height] duration-300 ease-out"
				style="height: {contentHeight}px"
			>
				<div bind:clientHeight={contentHeight}>
					{#if results.length > 0}
						<ScrollArea
							viewportStyle="mask-image: linear-gradient(to bottom, transparent, black 8px, black calc(100% - 8px), transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 8px, black calc(100% - 8px), transparent);"
							viewportClass="max-h-96 p-2"
						>
							{#each results as result, i (result.slug + (result.anchor || '') + i)}
								{@const isChild = result.matchType === 'heading' || result.matchType === 'content'}
								<button
									tabindex="-1"
									class={cn(
										'group relative flex w-full flex-col items-start gap-1 rounded-sm px-3 py-2 text-sm font-medium tracking-normal',
										isChild && 'pl-8',
										i === normalizedSelectedIndex
											? 'bg-background-muted text-foreground'
											: 'text-foreground hover:bg-background-muted'
									)}
									onclick={() => selectResult(result)}
									onmouseenter={() => (selectedIndex = i)}
								>
									{#if isChild}
										<div class={cn('absolute top-0 bottom-0 left-3 w-px bg-border')}></div>
									{/if}

									<div class="flex w-full flex-col items-start gap-0.5">
										{#if result.matchType !== 'content'}
											<div class="flex items-center gap-2 font-medium tracking-normal">
												{#if result.matchType === 'heading'}
													<span class="opacity-70">#</span>
												{/if}
												<span>
													{#each highlight(result.heading || result.title, query) as part, index (index)}
														{#if part.highlight}
															<span class="text-accent">{part.text}</span>
														{:else}
															{part.text}
														{/if}
													{/each}
												</span>
											</div>
										{/if}
										{#if result.snippet}
											<div
												class="line-clamp-1 text-left text-xs font-medium tracking-normal text-foreground-muted"
											>
												{#each highlight(result.snippet, query) as part, index (index)}
													{#if part.highlight}
														<span class="text-accent">{part.text}</span>
													{:else}
														{part.text}
													{/if}
												{/each}
											</div>
										{/if}
									</div>
								</button>
							{/each}
						</ScrollArea>
					{:else if query}
						<div class="py-6 text-center text-sm tracking-normal text-foreground-muted/70">
							{docsUiConfig.search.noResultsLabel}
						</div>
					{/if}
				</div>
			</div>
			<div
				class="flex w-full flex-row items-center justify-start gap-2 rounded-b-lg border-t border-border/60 bg-background p-2"
			>
				<kbd
					class="pointer-events-none inset-shadow relative hidden h-5 items-center gap-1 rounded-[calc(var(--radius-base)*1.5)] bg-background-inset px-1.5 font-mono text-[10px] font-medium text-foreground-muted/70 select-none sm:flex"
				>
					<Return class="size-3" />
				</kbd>
				<span class="text-xs font-medium tracking-normal text-foreground-muted/70">
					{docsUiConfig.search.submitHintLabel}
				</span>
			</div>
		</div>
	</div>
{/if}
