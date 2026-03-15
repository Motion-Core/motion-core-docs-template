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
	class="flex min-h-dvh w-full flex-col items-center justify-center bg-background"
>
	<h1>Hello World</h1>
</main>
