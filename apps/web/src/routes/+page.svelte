<script lang="ts">
	let mainContent = $state<HTMLElement | null>(null);
</script>

<a
	href="#main-content"
	class="sr-only fixed top-3 left-3 z-100 bg-foreground px-4 py-2 text-sm text-background-inset focus:not-sr-only"
>
	Skip to main content
</a>

<main
	id="main-content"
	bind:this={mainContent}
	tabindex="-1"
	class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center border-x border-border bg-background"
>
	<h1>Hello World</h1>
</main>
