<script lang="ts">
	import { page } from '$app/state';
	import DocsSidebar from './DocsSidebar.svelte';
	import { brandingConfig } from '$lib/config/branding';
	import Menu from 'carbon-icons-svelte/lib/Menu.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';

	let isOpen = $state(false);
	let isVisible = $state(false);
	let panelRef = $state<HTMLDivElement | null>(null);
	let toggleButtonRef = $state<HTMLButtonElement | null>(null);
	let closeButtonRef = $state<HTMLButtonElement | null>(null);
	let restoreFocusEl: HTMLElement | null = null;
	let wasOpen = false;
	const pathname = $derived(page.url.pathname);

	function open() {
		const activeElement = document.activeElement;
		restoreFocusEl = activeElement instanceof HTMLElement ? activeElement : toggleButtonRef;

		if (isVisible) {
			isOpen = true;
			return;
		}

		isVisible = true;
		requestAnimationFrame(() => {
			isOpen = true;
		});
	}

	function toggle() {
		if (isOpen) {
			close();
			return;
		}

		open();
	}

	function close() {
		isOpen = false;
	}

	function getFocusableElements() {
		if (!panelRef) return [];
		const selector =
			'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
		return Array.from(panelRef.querySelectorAll<HTMLElement>(selector)).filter(
			(element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
		);
	}

	function handleTabKey(event: KeyboardEvent) {
		if (!panelRef) return;

		const focusable = getFocusableElements();
		if (focusable.length === 0) {
			event.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

		if (event.shiftKey) {
			if (!activeElement || activeElement === first || !panelRef.contains(activeElement)) {
				event.preventDefault();
				last.focus();
			}
			return;
		}

		if (!activeElement || activeElement === last || !panelRef.contains(activeElement)) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (!isOpen) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			close();
			return;
		}

		if (event.key === 'Tab') {
			handleTabKey(event);
		}
	}

	function handleSidebarTransitionEnd(event: TransitionEvent) {
		if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
		if (!isOpen) isVisible = false;
	}

	$effect(() => {
		if (isOpen) {
			requestAnimationFrame(() => {
				closeButtonRef?.focus();
			});
		}
	});

	$effect(() => {
		if (isOpen && !wasOpen) {
			document.body.style.overflow = 'hidden';
		}

		if (!isOpen && wasOpen) {
			document.body.style.overflow = '';
			restoreFocusEl?.focus();
			restoreFocusEl = null;
		}

		wasOpen = isOpen;
	});

	$effect(() => {
		if (!isOpen) return;
		document.addEventListener('keydown', handleDocumentKeydown);
		return () => {
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});

	$effect(() => {
		return () => {
			document.body.style.overflow = '';
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});

	$effect(() => {
		void pathname;
		close();
	});
</script>

<div
	class="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-1.5 lg:hidden"
>
	<a
		href="/"
		class="inline-flex items-center gap-1 px-2 py-2 text-sm tracking-tight text-foreground transition-colors duration-150 ease-out hover:text-foreground"
	>
		<span
			class="inline-flex shrink-0 items-center text-accent [&>svg]:size-4 [&>svg]:fill-current"
			aria-hidden="true"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html brandingConfig.logoRaw}
		</span>
		<span class="font-medium tracking-tight text-foreground">{brandingConfig.name}</span>
	</a>
	<button
		bind:this={toggleButtonRef}
		onclick={toggle}
		class="-mr-2 inline-flex size-10 items-center justify-center gap-2 rounded-sm text-sm whitespace-nowrap text-foreground transition-colors duration-150 ease-out hover:bg-background-muted lg:hidden"
		aria-label="Toggle menu"
	>
		<Menu size={20} />
	</button>
</div>

{#if isVisible}
	<div
		class="overlay fixed inset-0 z-50 bg-background-inset/80 backdrop-blur-sm lg:hidden"
		class:active={isOpen}
		onclick={close}
		role="presentation"
		aria-hidden="true"
	></div>

	<div
		bind:this={panelRef}
		class="sidebar fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm overflow-hidden border-l border-border bg-background-inset text-foreground-muted lg:hidden"
		class:active={isOpen}
		ontransitionend={handleSidebarTransitionEnd}
		role="dialog"
		aria-modal="true"
		aria-label="Navigation menu"
		tabindex="-1"
	>
		<div class="absolute top-0 right-0 flex justify-end p-4">
			<button bind:this={closeButtonRef} onclick={close} aria-label="Close menu">
				<Close size={32} class="size-6" />
			</button>
		</div>
		<DocsSidebar />
	</div>
{/if}

<style>
	.overlay {
		opacity: 0;
		pointer-events: none;
		transition: opacity 200ms ease-out;
		will-change: opacity;
	}

	.overlay.active {
		opacity: 1;
		pointer-events: auto;
	}

	.sidebar {
		transform: translateX(100%);
		transition: transform 200ms ease-out;
		will-change: transform;
	}

	.sidebar.active {
		transform: translateX(0);
	}
</style>
