<script lang="ts">
	import { brandingConfig } from '$lib';
</script>

<a
	href="#main-content"
	class="sr-only fixed top-3 left-3 z-100 bg-foreground px-4 py-2 text-sm text-background-inset focus:not-sr-only"
>
	Skip to main content
</a>

<main
	id="main-content"
	tabindex="-1"
	class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background p-8"
>
	<section
		class="relative aspect-4/3 w-200 before:pointer-events-none before:absolute before:-top-px before:left-1/2 before:w-screen before:-translate-x-1/2 before:border-t before:border-dashed before:border-border before:content-[''] after:pointer-events-none after:absolute after:right-1/2 after:-bottom-px after:w-screen after:translate-x-1/2 after:border-t after:border-dashed after:border-border after:content-['']"
	>
		<div
			class="relative flex h-full w-full flex-col items-center justify-center gap-4 p-10 text-center before:pointer-events-none before:absolute before:top-1/2 before:-left-px before:h-dvh before:-translate-y-1/2 before:border-l before:border-dashed before:border-border before:content-[''] after:pointer-events-none after:absolute after:top-1/2 after:-right-px after:h-dvh after:-translate-y-1/2 after:border-l after:border-dashed after:border-border after:content-['']"
		>
			<span
				class="inline-flex text-accent [&_svg]:size-14 [&_svg]:fill-current md:[&_svg]:size-22"
				aria-hidden="true"
			>
				{@html brandingConfig.logoRaw}
			</span>

			<h1 class="text-4xl leading-none font-medium tracking-tight text-foreground md:text-6xl">
				Motion Core
			</h1>
			<p class="text-lg font-medium text-foreground-muted">Documentation Template</p>

			<div class="inset-shadow rounded-md border border-border bg-background-inset p-1">
				<a
					href="/docs"
					class="inline-flex items-center justify-center rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground no-underline shadow-md transition-[background-color] duration-150 ease-out hover:bg-background-muted"
				>
					Open Docs
				</a>
			</div>
		</div>
	</section>
</main>
